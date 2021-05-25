#!/usr/bin/env node

require('dotenv').config()
const { graphql } = require("@octokit/graphql");


var buffer = ""
const [, , ...args] = process.argv
const repo_path = args[0]

const org = repo_path.split('/')[0]
const repo = repo_path.split('/')[1]

var base_url = ''
if (args.length > 1)
  base_url = args[1]

console.log("org, repo, created at, dismissed at, package name, vulnerable version, severity, vulnerability id")      

var graphqlWithAuth;
if (base_url.length > 0)
{
  graphqlWithAuth = graphql.defaults({
    baseUrl: base_url + "/api",
    headers: {
      authorization: 'token ' + process.env.GH_AUTH_TOKEN,
    },
  });
}
else
{
  graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: 'token ' + process.env.GH_AUTH_TOKEN,
    },
  });
}
const query = `
{
    repository(name: "${repo}", owner: "${org}") {
        vulnerabilityAlerts(first: 100) {
            nodes {
                createdAt
                dismissedAt
                securityVulnerability {
                    package {
                        name
                    }
                  	severity
      							vulnerableVersionRange
                    advisory {
                        ghsaId
                      	publishedAt
                      	identifiers{
                          type
                          value
                        }
                    }
                }
            }
        }
    }
}`;

try {
  graphqlWithAuth(query, 
    
    ).then(alerts =>{
                      alerts.repository.vulnerabilityAlerts.nodes.forEach( (node)=> 
                      {console.log(`${org},${repo}, ${node.createdAt,node.createdAt}, ${node.createdAt,node.dismissedAt}, ${node.securityVulnerability.package.name}, ` + 
                        `${node.securityVulnerability.vulnerableVersionRange}, ${node.securityVulnerability.severity},` + 
                        `${node.securityVulnerability.advisory.ghsaId}`)})
     
    });

} catch (error) {
 

  console.log("Request failed:", error.request); 
  console.log(error.message); 
  console.log(error.data);
}



