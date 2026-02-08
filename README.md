# MSAIAgentPOC
AI Agent POC for MS - answers all AI questions and creates Case for all problems/issues/tickets

Pre-requisites(backend):
1. Create an AWS account and an AWS IAM service account role.
2. Download and configure the AWS CLI system with the above role and us-east-1 region.
3. Also run the npm commands inside the backend/terraform_code/backend folder to install all dependencies.
4. Make sure to put the open AI api key in backend/terraform/backend/submit.js
5. Install and run Terraform commands to generate the AWS backend infrastructure.
6. Once generated, make sure to verify the emails and domains on Amazon SES, so that it can send emails after case creation.
7. Also, please choose an autodeploy stage on API Gateway and enable CORS.

Pre-requisites(frontend):
1. Put your api gateway url from awsin the code
2. Host code on vercel.
