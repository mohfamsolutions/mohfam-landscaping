import {Client} from 'basic-ftp';
import {readFile,mkdir} from 'node:fs/promises';
import {Writable} from 'node:stream';
import {validateDeployment} from './deployment-gate.mjs';
const config=validateDeployment(JSON.parse(await readFile('deployment.json','utf8')));
if(process.env.FTP_VERIFIED_DIRECTORY!==config.verifiedHostingDirectory)throw Error('Protected environment destination differs from verified folder.');
if(!process.env.FTP_USERNAME||!process.env.FTP_PASSWORD)throw Error('Missing dedicated landscaping FTPS credentials.');
if(process.env.FTP_USERNAME!=='mohfamlandscaping@mohfamlandscaping.com')throw Error('A dedicated landscaping account is required.');
const proof=await fetch(config.canonicalOrigin+'/.well-known/mohfam-site-id.txt',{redirect:'error',signal:AbortSignal.timeout(20000)});
if(proof.status!==200||(await proof.text()).trim()!==config.verificationMarker)throw Error('HTTPS identity marker does not match.');
const client=new Client(30000);
try{
 await client.access({host:config.ftpHost,port:21,user:process.env.FTP_USERNAME,password:process.env.FTP_PASSWORD,secure:true,secureOptions:{rejectUnauthorized:true}});
 await client.cd(config.verifiedHostingDirectory);if(await client.pwd()!=='/')throw Error('Unexpected FTP root.');
 let marker='';await client.downloadTo(new Writable({write(c,e,done){marker+=c.toString();done();}}),'.well-known/mohfam-site-id.txt');if(marker.trim()!==config.verificationMarker)throw Error('FTPS identity mismatch.');
 await mkdir('artifacts',{recursive:true});
 // Back up managed website files before overwriting. Preserve cgi-bin and validation folders.
 const backup='artifacts/hosting-backup-'+new Date().toISOString().replace(/[:.]/g,'-');
 const entries=await client.list();await mkdir(backup,{recursive:true});
 for(const entry of entries){if(['.','..','cgi-bin','.well-known','.ftpquota'].includes(entry.name))continue;if(entry.isDirectory){await client.downloadToDir(backup+'/'+entry.name,entry.name);}else await client.downloadTo(backup+'/'+entry.name,entry.name);}
 await client.uploadFromDir('dist',config.verifiedHostingDirectory);
 console.log('Uploaded verified MohFam Landscaping build. TLS verified; no remote deletion.');
}finally{client.close();}
