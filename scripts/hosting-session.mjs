// Credentials are accepted through hidden stdin only, never arguments or files.
import {Client} from 'basic-ftp';
import {Readable,Writable} from 'node:stream';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const phase=process.argv[2]||'inspect';
console.log(`Ready for hidden credential JSON on stdin (${phase}).`);
if(process.stdin.isTTY)process.stdin.setRawMode(true);
let input='',started=false;
process.stdin.on('data',async chunk=>{
 input+=chunk.toString();if(started||!/[\r\n]/.test(input))return;started=true;process.stdin.pause();
 const client=new Client(25000);
 try{
  const credential=JSON.parse(input.trim());input='';
  await client.access({host:credential.host,port:21,user:credential.username,password:credential.password,secure:true,secureOptions:{rejectUnauthorized:true}});
  await client.cd('/');
  const entries=await client.list();
  console.log(JSON.stringify({host:credential.host,workingDirectory:await client.pwd(),entries:entries.map(x=>({name:x.name,directory:x.isDirectory,size:x.size}))}));
  if(phase==='probe'){
   if(entries.some(x=>!['.','..','.well-known','cgi-bin','.ftpquota'].includes(x.name)))throw Error('Destination has existing contents: review before creating mapping marker.');
   const marker='mohfam-landscaping-'+randomUUID();
   await client.ensureDir('/.well-known');
   if((await client.list()).some(e=>e.name==='mohfam-site-id.txt'))throw Error('Existing identity marker requires review before replacement.');
   await client.uploadFrom(Readable.from(marker+'\n'),'mohfam-site-id.txt');
   const response=await fetch('https://mohfamlandscaping.com/.well-known/mohfam-site-id.txt',{redirect:'error',signal:AbortSignal.timeout(20000)});
   if(response.status!==200||(await response.text()).trim()!==marker)throw Error('Landscaping domain does not match FTP marker.');
   const proof={host:credential.host,domain:'mohfamlandscaping.com',directory:'/',marker,tlsVerified:true,verifiedAt:new Date().toISOString()};
   await mkdir('artifacts',{recursive:true});await writeFile('artifacts/hosting-verification.json',JSON.stringify(proof,null,2));console.log('Verified dedicated landscaping FTPS root against HTTPS domain marker.');
  }else if(['publish','sync-config'].includes(phase)){
   const config=JSON.parse(await readFile('deployment.json','utf8'));
   if(!config.enabled||config.ftpHost!==credential.host||config.verifiedDomain!=='mohfamlandscaping.com'||config.verifiedHostingDirectory!=='/')throw Error('Verified configuration required.');
   const res=await fetch(config.canonicalOrigin+'/.well-known/mohfam-site-id.txt',{redirect:'error'});
   if(res.status!==200||(await res.text()).trim()!==config.verificationMarker)throw Error('HTTPS marker mismatch.');
   let marker='';await client.downloadTo(new Writable({write(c,e,done){marker+=c.toString();done();}}),'/.well-known/mohfam-site-id.txt');
   if(marker.trim()!==config.verificationMarker)throw Error('FTPS marker mismatch.');
   const backup=JSON.stringify(entries.map(e=>({name:e.name,size:e.size})),null,2);await writeFile('artifacts/predeploy-listing.json',backup);
   if(phase==='sync-config'){await client.uploadFrom('dist/404.php','/404.php');await client.uploadFrom('dist/.htaccess','/.htaccess');console.log('Updated verified landscaping redirect/error configuration.');}
   else{await client.uploadFromDir('dist','/');console.log('Uploaded landscaping build to verified dedicated root. No files deleted.');}
  }else if(phase!=='inspect')throw Error('Unsupported phase.');
  client.close();process.exit(0);
 }catch(error){client.close();console.error(error.message);process.exit(1);}
});
