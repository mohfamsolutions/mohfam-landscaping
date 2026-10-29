// One authorized synthetic test; restores the production mail configuration in finally.
import {Client} from 'basic-ftp';
import {Readable,Writable} from 'node:stream';
import {readFile,writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {randomUUID} from 'node:crypto';
import {validateDeployment} from './deployment-gate.mjs';
const config=validateDeployment(JSON.parse(await readFile('deployment.json','utf8')));
console.log('Ready for hidden credential JSON on stdin (one delivery test, configuration restored).');
if(process.stdin.isTTY)process.stdin.setRawMode(true);let input='',started=false;
process.stdin.on('data',async chunk=>{input+=chunk.toString();if(started||!/[\r\n]/.test(input))return;started=true;process.stdin.pause();const client=new Client(25000);let original='',modified=false;
try{const credential=JSON.parse(input.trim());input='';await client.access({host:config.ftpHost,port:21,user:credential.username,password:credential.password,secure:true,secureOptions:{rejectUnauthorized:true}});let marker='';await client.downloadTo(new Writable({write(c,e,done){marker+=c.toString();done();}}),'/.well-known/mohfam-site-id.txt');if(marker.trim()!==config.verificationMarker)throw Error('Destination marker mismatch.');await client.downloadTo(new Writable({write(c,e,done){original+=c.toString();done();}}),'/api/.htaccess');
const temporary=original.replace('LANDSCAPING_MAIL_ENABLED 0','LANDSCAPING_MAIL_ENABLED 1').replace('LANDSCAPING_MAIL_AUTH_REVIEWED 0','LANDSCAPING_MAIL_AUTH_REVIEWED 1');
modified=true;await client.uploadFrom(Readable.from(temporary),'/api/.htaccess');
const session=await fetch(config.canonicalOrigin+'/api/contact.php',{cache:'no-store'});const state=await session.json();if(!state.mailReady)throw Error('Temporary test mail configuration not active.');const cookie=session.headers.get('set-cookie').split(';')[0];
await delay(3200);const reference='LAND-DEPLOY-'+randomUUID().slice(0,8).toUpperCase();const body=new URLSearchParams({csrf:state.csrf,name:'MohFam Deployment Check',email:'mohfamsolutions@gmail.com',phone:'',location:'Deployment verification',property:'Other property',service:'not-sure',message:`Authorized website deployment test ${reference}. Synthetic data only; this is not a customer inquiry. Confirm subject prefix and Reply-To headers.`,consent:'yes',website:''});
const response=await fetch(config.canonicalOrigin+'/api/contact.php',{method:'POST',headers:{Origin:config.canonicalOrigin,Cookie:cookie},body});const result=await response.json();await writeFile('artifacts/mail-test.json',JSON.stringify({reference,status:response.status,result,sentAt:new Date().toISOString(),recipient:'mohfamsolutions@gmail.com',replyTo:'mohfamsolutions@gmail.com',note:'Server acceptance only. Inbox and authentication must be checked independently.'},null,2));console.log(JSON.stringify({reference,status:response.status,result}));
}catch(error){console.error(error.message);process.exitCode=1;}finally{try{if(modified){await client.uploadFrom(Readable.from(original),'/api/.htaccess');console.log('Restored production mail configuration.');}}catch(error){console.error('URGENT: configuration restore failed: '+error.message);process.exitCode=1;}client.close();process.exit(process.exitCode||0);}});
