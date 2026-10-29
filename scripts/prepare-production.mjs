// Generates only non-secret hosting environment values. Credentials never enter dist.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {validateDeployment} from './deployment-gate.mjs';
const config=validateDeployment(JSON.parse(await readFile('deployment.json','utf8')));
await mkdir('dist/api',{recursive:true});
await writeFile('dist/api/.htaccess',`SetEnv LANDSCAPING_ORIGIN ${config.canonicalOrigin}\nSetEnv LANDSCAPING_MAIL_FROM website@${config.verifiedDomain}\nSetEnv LANDSCAPING_MAIL_ENABLED ${config.mailEnabled?'1':'0'}\nSetEnv LANDSCAPING_MAIL_AUTH_REVIEWED ${config.inboxDeliveryVerified?'1':'0'}\n`);
