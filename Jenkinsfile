// Frontend deploy pipeline: build the Docker image, push to GHCR, redeploy
// the frontend box via SSM Run Command. Runs on the Jenkins box itself (no
// agents) — mirrors homelink-bn's own Jenkinsfile.
//
// Requires (see homelink-bn's infra/README.md):
//   - A Jenkins credential, ID "ghcr-token": username = GitHub username,
//     password = a GitHub PAT with write:packages.
//   - /etc/homelink/deploy.env on the box (written by homelink-bn's
//     infra/terraform/user-data/jenkins.sh.tpl) — provides AWS_REGION and
//     FRONTEND_INSTANCE_ID.
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        // Pushed under IshKevin's GHCR namespace (this repo's own GHCR
        // package permissions aren't confirmed), matching
        // ghcr_username in homelink-bn's terraform.tfvars.
        REPOSITORY = "ghcr.io/ishkevin/homelinkrwa"
        IMAGE_TAG  = "${env.GIT_COMMIT}"
    }

    stages {
        stage('Build & push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ghcr-token', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PASS')]) {
                    sh '''
                        set -euo pipefail
                        echo "$GHCR_PASS" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
                        docker build \
                          --build-arg GIT_COMMIT="$IMAGE_TAG" \
                          --build-arg BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                          --build-arg IMAGE_TAG="$IMAGE_TAG" \
                          -t "$REPOSITORY:$IMAGE_TAG" .
                        docker push "$REPOSITORY:$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Deploy via SSM') {
            steps {
                sh '''
                    set -euo pipefail
                    . /etc/homelink/deploy.env

                    DEPLOY_SCRIPT="set -euo pipefail; cd /opt/homelink-frontend; git pull; render-env.sh; export IMAGE_TAG=$IMAGE_TAG; docker compose -f infra/docker-compose.prod.yml --env-file .env pull frontend; docker compose -f infra/docker-compose.prod.yml --env-file .env up -d"

                    COMMAND_ID=$(aws ssm send-command \
                      --instance-ids "$FRONTEND_INSTANCE_ID" \
                      --document-name "AWS-RunShellScript" \
                      --comment "Deploy frontend $IMAGE_TAG (Jenkins build $BUILD_NUMBER)" \
                      --parameters commands="[\\"sudo -u ec2-user -i bash -c '$DEPLOY_SCRIPT'\\"]" \
                      --region "$AWS_REGION" \
                      --query "Command.CommandId" --output text)

                    aws ssm wait command-executed --command-id "$COMMAND_ID" --instance-id "$FRONTEND_INSTANCE_ID" --region "$AWS_REGION" || true

                    STATUS=$(aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$FRONTEND_INSTANCE_ID" --region "$AWS_REGION" --query "Status" --output text)
                    aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$FRONTEND_INSTANCE_ID" --region "$AWS_REGION" --query "StandardOutputContent" --output text
                    aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$FRONTEND_INSTANCE_ID" --region "$AWS_REGION" --query "StandardErrorContent" --output text >&2

                    if [ "$STATUS" != "Success" ]; then
                      echo "Deploy command finished with status: $STATUS"
                      exit 1
                    fi
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout ghcr.io || true'
        }
    }
}
