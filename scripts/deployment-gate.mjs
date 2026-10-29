import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function validateDeployment(config){
 if(!config.enabled||config.verifiedDomain!=='mohfamlandscaping.com'||config.verifiedHostingDirectory!=='/'||!/^mohfam-landscaping-[a-f0-9-]{36}$/.test(config.verificationMarker||'')||config.canonicalOrigin!=='https://mohfamlandscaping.com'||config.ftpHost!=='p3plmcpnl503624.prod.phx3.secureserver.net')throw Error('Production upload disabled: landscaping domain and dedicated hosting folder must be verified.');
 if(config.mailEnabled&&!config.inboxDeliveryVerified)throw Error('Mail must stay disabled until inbox delivery is verified.');
 return config;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{validateDeployment(JSON.parse(await readFile('deployment.json','utf8')));console.log('Verified landscaping deployment configuration. Upload still requires matching HTTPS and FTPS markers.');}catch(e){console.error(e.message);process.exit(1);}}
