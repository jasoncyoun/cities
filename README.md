# Cities
A little game built on Go, Vue.js, and AWS Lambda using Serverless Framework. Runs locally using docker containers. Just make sure you seed your database (import_script.rb).


Make sure you have a template.yml file that contains environment variables for DB_HOST, DB_USER, and DB_PASS.

Make sure you have a serverless.env.yml file that contains dev and prod-specific variables for the above.

Don't forget to set CORS policies in API gateway.  [This might help]( https://enable-cors.org/server_awsapigateway.html)