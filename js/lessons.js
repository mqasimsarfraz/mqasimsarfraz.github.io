/* ============================================
   Playground Lesson Definitions & Manager
   ============================================ */

(function () {
    'use strict';

    // --- Lesson Definitions ---
    var LESSONS = {

        // ============================
        // LINUX LESSONS
        // ============================

        'linux-navigation': {
            title: 'File System Navigation',
            category: 'linux',
            steps: [
                {
                    instruction: "Welcome! Let's learn to navigate the Linux file system. First, find out where you are by typing `pwd` (print working directory).",
                    validate: function (cmd) { return cmd.trim() === 'pwd'; },
                    hint: 'Type: pwd'
                },
                {
                    instruction: "You're in your home directory! Now let's see what files and folders are here. Type `ls` to list the contents.",
                    validate: function (cmd) { return cmd.trim().startsWith('ls'); },
                    hint: 'Type: ls'
                },
                {
                    instruction: "You can see several directories. Let's go into the `projects` directory using `cd projects`.",
                    validate: function (cmd) { return cmd.trim() === 'cd projects'; },
                    hint: 'Type: cd projects'
                },
                {
                    instruction: "Now check where you are with `pwd` to confirm you moved.",
                    validate: function (cmd) { return cmd.trim() === 'pwd'; },
                    hint: 'Type: pwd'
                },
                {
                    instruction: "Let's see what's inside. Use `ls -la` to see a detailed listing including hidden files.",
                    validate: function (cmd) { return cmd.trim().match(/^ls\s+(-la|-al|-l\s+-a|-a\s+-l)/); },
                    hint: 'Type: ls -la'
                },
                {
                    instruction: "Let's explore deeper. Go into the `app` directory.",
                    validate: function (cmd) { return cmd.trim() === 'cd app'; },
                    hint: 'Type: cd app'
                },
                {
                    instruction: "Use `ls` to see what's in the app directory.",
                    validate: function (cmd) { return cmd.trim().startsWith('ls'); },
                    hint: 'Type: ls'
                },
                {
                    instruction: "Now go back to the parent directory using `cd ..`",
                    validate: function (cmd) { return cmd.trim() === 'cd ..'; },
                    hint: 'Type: cd ..'
                },
                {
                    instruction: "Finally, jump straight to your home directory with `cd ~`",
                    validate: function (cmd) { return cmd.trim() === 'cd ~' || cmd.trim() === 'cd'; },
                    hint: 'Type: cd ~'
                },
                {
                    instruction: "🎉 Excellent! You've learned the basics of navigating the Linux file system: `pwd`, `ls`, and `cd`. You can also use `tree` to see the full directory structure — try it if you like!",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'linux-files': {
            title: 'Working with Files',
            category: 'linux',
            steps: [
                {
                    instruction: "Let's learn how to work with files! First, read the contents of a file using `cat readme.txt`.",
                    validate: function (cmd) { return cmd.trim() === 'cat readme.txt'; },
                    hint: 'Type: cat readme.txt'
                },
                {
                    instruction: "Now create a new empty file using `touch myfile.txt`.",
                    validate: function (cmd) { return cmd.trim() === 'touch myfile.txt'; },
                    hint: 'Type: touch myfile.txt'
                },
                {
                    instruction: "Write some content to it using: `echo \"Hello, Linux!\" > myfile.txt`",
                    validate: function (cmd) { return cmd.includes('echo') && cmd.includes('>') && cmd.includes('myfile.txt'); },
                    hint: 'Type: echo "Hello, Linux!" > myfile.txt'
                },
                {
                    instruction: "Read your file back with `cat myfile.txt` to verify it worked.",
                    validate: function (cmd) { return cmd.trim() === 'cat myfile.txt'; },
                    hint: 'Type: cat myfile.txt'
                },
                {
                    instruction: "Let's make a copy of the file: `cp myfile.txt backup.txt`",
                    validate: function (cmd) { return cmd.trim() === 'cp myfile.txt backup.txt'; },
                    hint: 'Type: cp myfile.txt backup.txt'
                },
                {
                    instruction: "Now create a new directory for backups: `mkdir backups`",
                    validate: function (cmd) { return cmd.trim() === 'mkdir backups'; },
                    hint: 'Type: mkdir backups'
                },
                {
                    instruction: "Move the backup file into the new directory: `mv backup.txt backups/`",
                    validate: function (cmd) { return cmd.includes('mv') && cmd.includes('backup.txt') && cmd.includes('backups'); },
                    hint: 'Type: mv backup.txt backups/'
                },
                {
                    instruction: "Check the backups directory: `ls backups`",
                    validate: function (cmd) { return cmd.trim() === 'ls backups' || cmd.trim() === 'ls backups/'; },
                    hint: 'Type: ls backups'
                },
                {
                    instruction: "Clean up by removing the original: `rm myfile.txt`",
                    validate: function (cmd) { return cmd.trim() === 'rm myfile.txt'; },
                    hint: 'Type: rm myfile.txt'
                },
                {
                    instruction: "🎉 Great job! You've learned: `cat`, `touch`, `echo >`, `cp`, `mkdir`, `mv`, and `rm`. These are the essential file operations in Linux!",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'linux-text': {
            title: 'Text Processing',
            category: 'linux',
            steps: [
                {
                    instruction: "Linux has powerful text processing tools. Let's start by looking at a log file: `cat data/logs.txt`",
                    validate: function (cmd) { return cmd.trim() === 'cat data/logs.txt'; },
                    hint: 'Type: cat data/logs.txt'
                },
                {
                    instruction: "That's a lot of output! View just the first 3 lines with `head -n 3 data/logs.txt`",
                    validate: function (cmd) { return cmd.includes('head') && cmd.includes('data/logs.txt'); },
                    hint: 'Type: head -n 3 data/logs.txt'
                },
                {
                    instruction: "Now see the last 3 lines with `tail -n 3 data/logs.txt`",
                    validate: function (cmd) { return cmd.includes('tail') && cmd.includes('data/logs.txt'); },
                    hint: 'Type: tail -n 3 data/logs.txt'
                },
                {
                    instruction: "Let's search for errors! Use `grep ERROR data/logs.txt` to find all error lines.",
                    validate: function (cmd) { return cmd.includes('grep') && cmd.includes('ERROR') && cmd.includes('data/logs.txt'); },
                    hint: 'Type: grep ERROR data/logs.txt'
                },
                {
                    instruction: "Count how many error lines there are: `grep -c ERROR data/logs.txt`",
                    validate: function (cmd) { return cmd.includes('grep') && cmd.includes('-c') && cmd.includes('ERROR'); },
                    hint: 'Type: grep -c ERROR data/logs.txt'
                },
                {
                    instruction: "Search for all warnings too — use case-insensitive search: `grep -i warn data/logs.txt`",
                    validate: function (cmd) { return cmd.includes('grep') && cmd.includes('-i') && cmd.toLowerCase().includes('warn'); },
                    hint: 'Type: grep -i warn data/logs.txt'
                },
                {
                    instruction: "Let's count lines, words, and characters in the file: `wc data/logs.txt`",
                    validate: function (cmd) { return cmd.includes('wc') && cmd.includes('data/logs.txt'); },
                    hint: 'Type: wc data/logs.txt'
                },
                {
                    instruction: "Now explore the CSV file: `cat data/users.csv`",
                    validate: function (cmd) { return cmd.trim() === 'cat data/users.csv'; },
                    hint: 'Type: cat data/users.csv'
                },
                {
                    instruction: "Find all developers in the CSV: `grep developer data/users.csv`",
                    validate: function (cmd) { return cmd.includes('grep') && cmd.includes('developer') && cmd.includes('users.csv'); },
                    hint: 'Type: grep developer data/users.csv'
                },
                {
                    instruction: "🎉 You've mastered text processing! `head`, `tail`, `grep`, and `wc` are essential tools for log analysis and data processing.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'linux-permissions': {
            title: 'File Permissions',
            category: 'linux',
            steps: [
                {
                    instruction: "Understanding file permissions is crucial in Linux. Let's look at file permissions with `ls -l projects/hello.sh`",
                    validate: function (cmd) { return cmd.includes('ls') && cmd.includes('-l') && cmd.includes('hello.sh'); },
                    hint: 'Type: ls -l projects/hello.sh'
                },
                {
                    instruction: "The first column shows permissions (e.g., -rw-r--r--). Let's see who you are: `whoami`",
                    validate: function (cmd) { return cmd.trim() === 'whoami'; },
                    hint: 'Type: whoami'
                },
                {
                    instruction: "Let's view the script content: `cat projects/hello.sh`",
                    validate: function (cmd) { return cmd.includes('cat') && cmd.includes('hello.sh'); },
                    hint: 'Type: cat projects/hello.sh'
                },
                {
                    instruction: "Make the script executable with `chmod 755 projects/hello.sh`. The 7 (rwx) means owner can read, write, execute. 5 (r-x) means group and others can read and execute.",
                    validate: function (cmd) { return cmd.includes('chmod') && cmd.includes('755') && cmd.includes('hello.sh'); },
                    hint: 'Type: chmod 755 projects/hello.sh'
                },
                {
                    instruction: "Verify the permissions changed: `ls -l projects/hello.sh`",
                    validate: function (cmd) { return cmd.includes('ls') && cmd.includes('-l') && cmd.includes('hello.sh'); },
                    hint: 'Type: ls -l projects/hello.sh'
                },
                {
                    instruction: "Now let's look at a config file: `ls -l data/config.json`",
                    validate: function (cmd) { return cmd.includes('ls') && cmd.includes('-l') && cmd.includes('config.json'); },
                    hint: 'Type: ls -l data/config.json'
                },
                {
                    instruction: "Make the config file read-only with `chmod 444 data/config.json` — this prevents accidental modification.",
                    validate: function (cmd) { return cmd.includes('chmod') && cmd.includes('444') && cmd.includes('config.json'); },
                    hint: 'Type: chmod 444 data/config.json'
                },
                {
                    instruction: "🎉 You've learned about Linux file permissions! The permission system uses three sets of rwx (read/write/execute) for owner, group, and others.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        // ============================
        // DOCKER LESSONS
        // ============================

        'docker-basics': {
            title: 'Container Basics',
            category: 'docker',
            steps: [
                {
                    instruction: "Welcome to Docker! Let's start by listing available images: `docker images`",
                    validate: function (cmd) { return cmd.trim() === 'docker images'; },
                    hint: 'Type: docker images'
                },
                {
                    instruction: "You have several images ready. Let's run a container from the nginx image: `docker run -d --name web nginx`",
                    validate: function (cmd) { return cmd.includes('docker run') && cmd.includes('nginx'); },
                    hint: 'Type: docker run -d --name web nginx'
                },
                {
                    instruction: "Your container is running! Check running containers with `docker ps`",
                    validate: function (cmd) { return cmd.trim() === 'docker ps'; },
                    hint: 'Type: docker ps'
                },
                {
                    instruction: "Let's view the container's logs: `docker logs web`",
                    validate: function (cmd) { return cmd.includes('docker logs') && cmd.includes('web'); },
                    hint: 'Type: docker logs web'
                },
                {
                    instruction: "Now inspect the container for detailed info: `docker inspect web`",
                    validate: function (cmd) { return cmd.includes('docker inspect') && cmd.includes('web'); },
                    hint: 'Type: docker inspect web'
                },
                {
                    instruction: "Time to stop the container: `docker stop web`",
                    validate: function (cmd) { return cmd.includes('docker stop') && cmd.includes('web'); },
                    hint: 'Type: docker stop web'
                },
                {
                    instruction: "Check all containers including stopped ones: `docker ps -a`",
                    validate: function (cmd) { return cmd.includes('docker ps') && cmd.includes('-a'); },
                    hint: 'Type: docker ps -a'
                },
                {
                    instruction: "Remove the stopped container: `docker rm web`",
                    validate: function (cmd) { return cmd.includes('docker rm') && cmd.includes('web'); },
                    hint: 'Type: docker rm web'
                },
                {
                    instruction: "🎉 You've learned the Docker container lifecycle: run → inspect → logs → stop → rm. These are the most common operations you'll perform!",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'docker-images': {
            title: 'Images & Building',
            category: 'docker',
            steps: [
                {
                    instruction: "Docker images are blueprints for containers. Let's pull a new image: `docker pull redis:7-alpine`",
                    validate: function (cmd) { return cmd.includes('docker pull'); },
                    hint: 'Type: docker pull redis:7-alpine'
                },
                {
                    instruction: "List all images to see your new one: `docker images`",
                    validate: function (cmd) { return cmd.trim() === 'docker images'; },
                    hint: 'Type: docker images'
                },
                {
                    instruction: "Now let's look at a Dockerfile. Check the app directory: `cat projects/app/Dockerfile`",
                    validate: function (cmd) { return cmd.includes('cat') && cmd.includes('Dockerfile'); },
                    hint: 'Type: cat projects/app/Dockerfile'
                },
                {
                    instruction: "This Dockerfile builds a Go application. Let's build it: `docker build -t my-app:latest projects/app`",
                    validate: function (cmd) { return cmd.includes('docker build'); },
                    hint: 'Type: docker build -t my-app:latest projects/app'
                },
                {
                    instruction: "Check that your new image was created: `docker images`",
                    validate: function (cmd) { return cmd.trim() === 'docker images'; },
                    hint: 'Type: docker images'
                },
                {
                    instruction: "Now run a container from your custom image with port mapping: `docker run -d --name my-app -p 8080:8080 my-app:latest`",
                    validate: function (cmd) { return cmd.includes('docker run') && cmd.includes('my-app'); },
                    hint: 'Type: docker run -d --name my-app -p 8080:8080 my-app:latest'
                },
                {
                    instruction: "Verify it's running: `docker ps`",
                    validate: function (cmd) { return cmd.trim() === 'docker ps'; },
                    hint: 'Type: docker ps'
                },
                {
                    instruction: "🎉 You've learned about Docker images! Key concepts: Dockerfile defines build steps, `docker build` creates images, and `-p` maps ports between host and container.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'docker-networking': {
            title: 'Container Networking',
            category: 'docker',
            steps: [
                {
                    instruction: "Containers can communicate over networks. List existing networks: `docker network ls`",
                    validate: function (cmd) { return cmd.includes('docker network') && (cmd.includes('ls') || cmd.trim() === 'docker network'); },
                    hint: 'Type: docker network ls'
                },
                {
                    instruction: "Docker comes with bridge, host, and none networks. Create a custom network: `docker network create my-network`",
                    validate: function (cmd) { return cmd.includes('docker network create'); },
                    hint: 'Type: docker network create my-network'
                },
                {
                    instruction: "Verify the new network: `docker network ls`",
                    validate: function (cmd) { return cmd.includes('docker network'); },
                    hint: 'Type: docker network ls'
                },
                {
                    instruction: "Now run a Redis container on your network: `docker run -d --name redis-server redis:7-alpine`",
                    validate: function (cmd) { return cmd.includes('docker run') && cmd.includes('redis'); },
                    hint: 'Type: docker run -d --name redis-server redis:7-alpine'
                },
                {
                    instruction: "Run another container (an app) on the same network: `docker run -d --name app-server nginx`",
                    validate: function (cmd) { return cmd.includes('docker run') && cmd.includes('nginx'); },
                    hint: 'Type: docker run -d --name app-server nginx'
                },
                {
                    instruction: "Check both containers are running: `docker ps`",
                    validate: function (cmd) { return cmd.trim() === 'docker ps'; },
                    hint: 'Type: docker ps'
                },
                {
                    instruction: "🎉 You've learned Docker networking! Containers on the same custom network can communicate using container names as hostnames. This is the foundation of multi-container applications.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'docker-volumes': {
            title: 'Volumes & Storage',
            category: 'docker',
            steps: [
                {
                    instruction: "Containers are ephemeral — data is lost when they stop. Volumes solve this! List existing volumes: `docker volume ls`",
                    validate: function (cmd) { return cmd.includes('docker volume') && (cmd.includes('ls') || cmd.trim() === 'docker volume'); },
                    hint: 'Type: docker volume ls'
                },
                {
                    instruction: "Create a named volume for persistent storage: `docker volume create app-data`",
                    validate: function (cmd) { return cmd.includes('docker volume create'); },
                    hint: 'Type: docker volume create app-data'
                },
                {
                    instruction: "Inspect the volume to see where data is stored: `docker volume inspect app-data`",
                    validate: function (cmd) { return cmd.includes('docker volume inspect'); },
                    hint: 'Type: docker volume inspect app-data'
                },
                {
                    instruction: "Verify the volume was created: `docker volume ls`",
                    validate: function (cmd) { return cmd.includes('docker volume ls'); },
                    hint: 'Type: docker volume ls'
                },
                {
                    instruction: "Now run a database container using this volume: `docker run -d --name db redis:7-alpine`",
                    validate: function (cmd) { return cmd.includes('docker run') && cmd.includes('db'); },
                    hint: 'Type: docker run -d --name db redis:7-alpine'
                },
                {
                    instruction: "Check that the container is running: `docker ps`",
                    validate: function (cmd) { return cmd.trim() === 'docker ps'; },
                    hint: 'Type: docker ps'
                },
                {
                    instruction: "🎉 You've learned about Docker volumes! Volumes persist data beyond the container lifecycle. Always use named volumes for databases and important data.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        // ============================
        // KUBERNETES LESSONS
        // ============================

        'k8s-basics': {
            title: 'Cluster Basics',
            category: 'k8s',
            steps: [
                {
                    instruction: "Welcome to Kubernetes! Let's explore your cluster. First, check the cluster context: `kubectl config current-context`",
                    validate: function (cmd) { return cmd.includes('kubectl config current-context'); },
                    hint: 'Type: kubectl config current-context'
                },
                {
                    instruction: "Now see all contexts available: `kubectl config get-contexts`",
                    validate: function (cmd) { return cmd.includes('kubectl config get-contexts'); },
                    hint: 'Type: kubectl config get-contexts'
                },
                {
                    instruction: "Let's see the nodes in your cluster: `kubectl get nodes`",
                    validate: function (cmd) { return cmd.includes('kubectl get node'); },
                    hint: 'Type: kubectl get nodes'
                },
                {
                    instruction: "You have a 3-node cluster! Let's see more details about a specific node: `kubectl describe node node-1`",
                    validate: function (cmd) { return cmd.includes('kubectl describe node'); },
                    hint: 'Type: kubectl describe node node-1'
                },
                {
                    instruction: "Now let's see what pods are running across all namespaces: `kubectl get pods --all-namespaces`",
                    validate: function (cmd) { return cmd.includes('kubectl get pods') && (cmd.includes('--all-namespaces') || cmd.includes('-A')); },
                    hint: 'Type: kubectl get pods --all-namespaces'
                },
                {
                    instruction: "Check the services in your default namespace: `kubectl get services`",
                    validate: function (cmd) { return cmd.includes('kubectl get service') || cmd.includes('kubectl get svc'); },
                    hint: 'Type: kubectl get services'
                },
                {
                    instruction: "🎉 You've explored a Kubernetes cluster! Key concepts: Nodes run workloads, Pods are the smallest unit, Services expose pods to the network.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'k8s-pods': {
            title: 'Pods & Deployments',
            category: 'k8s',
            steps: [
                {
                    instruction: "Let's create your first deployment! Use: `kubectl create deployment nginx-app --image=nginx`",
                    validate: function (cmd) { return cmd.includes('kubectl create deployment') && cmd.includes('--image'); },
                    hint: 'Type: kubectl create deployment nginx-app --image=nginx'
                },
                {
                    instruction: "Check that the deployment was created: `kubectl get deployments`",
                    validate: function (cmd) { return cmd.includes('kubectl get deploy'); },
                    hint: 'Type: kubectl get deployments'
                },
                {
                    instruction: "See the pods created by this deployment: `kubectl get pods`",
                    validate: function (cmd) { return cmd.includes('kubectl get pod'); },
                    hint: 'Type: kubectl get pods'
                },
                {
                    instruction: "Now let's scale it up to 3 replicas: `kubectl scale deployment/nginx-app --replicas=3`",
                    validate: function (cmd) { return cmd.includes('kubectl scale') && cmd.includes('--replicas'); },
                    hint: 'Type: kubectl scale deployment/nginx-app --replicas=3'
                },
                {
                    instruction: "Watch the pods — you should see 3 now: `kubectl get pods`",
                    validate: function (cmd) { return cmd.includes('kubectl get pod'); },
                    hint: 'Type: kubectl get pods'
                },
                {
                    instruction: "Let's also deploy from a YAML file. First, view it: `cat projects/app/deployment.yaml`",
                    validate: function (cmd) { return cmd.includes('cat') && cmd.includes('deployment.yaml'); },
                    hint: 'Type: cat projects/app/deployment.yaml'
                },
                {
                    instruction: "Apply the deployment YAML: `kubectl apply -f projects/app/deployment.yaml`",
                    validate: function (cmd) { return cmd.includes('kubectl apply') && cmd.includes('deployment.yaml'); },
                    hint: 'Type: kubectl apply -f projects/app/deployment.yaml'
                },
                {
                    instruction: "Check all deployments now: `kubectl get deployments`",
                    validate: function (cmd) { return cmd.includes('kubectl get deploy'); },
                    hint: 'Type: kubectl get deployments'
                },
                {
                    instruction: "🎉 Excellent! You've learned Deployments — the primary way to manage pods in Kubernetes. You can create them imperatively or declaratively with YAML, and scale them up or down.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'k8s-services': {
            title: 'Services & Networking',
            category: 'k8s',
            steps: [
                {
                    instruction: "Pods get random IPs, so we need Services to provide stable endpoints. First, ensure we have a deployment: `kubectl get deployments`",
                    validate: function (cmd) { return cmd.includes('kubectl get deploy'); },
                    hint: 'Type: kubectl get deployments'
                },
                {
                    instruction: "If you don't have a deployment, create one first. Otherwise, let's expose it as a service: `kubectl expose deployment nginx-app --port=80 --target-port=80`",
                    validate: function (cmd) { return cmd.includes('kubectl expose'); },
                    hint: 'Type: kubectl expose deployment nginx-app --port=80 --target-port=80'
                },
                {
                    instruction: "Check the service was created: `kubectl get services`",
                    validate: function (cmd) { return cmd.includes('kubectl get service') || cmd.includes('kubectl get svc'); },
                    hint: 'Type: kubectl get services'
                },
                {
                    instruction: "Get detailed info about the service: `kubectl describe service nginx-app-service`",
                    validate: function (cmd) { return cmd.includes('kubectl describe') && (cmd.includes('service') || cmd.includes('svc')); },
                    hint: 'Type: kubectl describe service nginx-app-service'
                },
                {
                    instruction: "Now let's apply a service from a YAML file: `cat projects/app/service.yaml`",
                    validate: function (cmd) { return cmd.includes('cat') && cmd.includes('service.yaml'); },
                    hint: 'Type: cat projects/app/service.yaml'
                },
                {
                    instruction: "Apply it: `kubectl apply -f projects/app/service.yaml`",
                    validate: function (cmd) { return cmd.includes('kubectl apply') && cmd.includes('service.yaml'); },
                    hint: 'Type: kubectl apply -f projects/app/service.yaml'
                },
                {
                    instruction: "Check all services now: `kubectl get svc`",
                    validate: function (cmd) { return cmd.includes('kubectl get s'); },
                    hint: 'Type: kubectl get svc'
                },
                {
                    instruction: "🎉 You've learned about Kubernetes Services! Services provide stable networking for pods — ClusterIP for internal access, NodePort and LoadBalancer for external access.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        },

        'k8s-debugging': {
            title: 'Debugging Workloads',
            category: 'k8s',
            steps: [
                {
                    instruction: "Debugging is a critical skill. Let's start by checking if we have any pods: `kubectl get pods`",
                    validate: function (cmd) { return cmd.includes('kubectl get pod'); },
                    hint: 'Type: kubectl get pods'
                },
                {
                    instruction: "If you don't have pods, create a deployment first. Now let's check the detailed status of a pod. Copy a pod name and run: `kubectl describe pod <pod-name>` (use any pod name from the list above).",
                    validate: function (cmd) { return cmd.includes('kubectl describe pod'); },
                    hint: 'Type: kubectl describe pod <name> (use a pod name from the list)'
                },
                {
                    instruction: "View the pod's logs to see its output: `kubectl logs <pod-name>` (use any pod name).",
                    validate: function (cmd) { return cmd.includes('kubectl logs'); },
                    hint: 'Type: kubectl logs <pod-name>'
                },
                {
                    instruction: "You can also check the deployment status: `kubectl describe deployment <deployment-name>` (try any deployment).",
                    validate: function (cmd) { return cmd.includes('kubectl describe deploy'); },
                    hint: 'Type: kubectl describe deployment <name>'
                },
                {
                    instruction: "Let's clean up — delete a deployment: `kubectl delete deployment nginx-app` (or any deployment name).",
                    validate: function (cmd) { return cmd.includes('kubectl delete'); },
                    hint: 'Type: kubectl delete deployment <name>'
                },
                {
                    instruction: "Verify it's gone: `kubectl get deployments`",
                    validate: function (cmd) { return cmd.includes('kubectl get deploy'); },
                    hint: 'Type: kubectl get deployments'
                },
                {
                    instruction: "🎉 You've learned Kubernetes debugging essentials! `describe` shows events and config, `logs` shows container output, and `exec` lets you run commands inside pods.",
                    validate: function () { return true; },
                    hint: 'Type anything to finish',
                    isComplete: true
                }
            ]
        }
    };

    // --- Lesson Manager ---
    function LessonManager() {
        this.terminal = null;
        this.currentLessonId = null;
        this.currentStep = 0;
        this.completedLessons = JSON.parse(localStorage.getItem('playground_completed') || '{}');
    }

    LessonManager.prototype.init = function (terminal) {
        this.terminal = terminal;
        this._setupUI();
        this._updateSidebarStatus();
    };

    LessonManager.prototype._setupUI = function () {
        var self = this;

        // Lesson item clicks
        document.querySelectorAll('.lesson-item').forEach(function (item) {
            item.addEventListener('click', function () {
                var lessonId = this.getAttribute('data-lesson');
                self.startLesson(lessonId);
            });
        });

        // Welcome category clicks
        document.querySelectorAll('.welcome-category').forEach(function (cat) {
            cat.addEventListener('click', function () {
                var category = this.getAttribute('data-category');
                var firstLesson = Object.keys(LESSONS).find(function (id) {
                    return LESSONS[id].category === category;
                });
                if (firstLesson) self.startLesson(firstLesson);
            });
        });

        // Mobile sidebar toggle
        var sidebarToggle = document.getElementById('sidebar-toggle');
        var sidebar = document.getElementById('playground-sidebar');
        var overlay = document.getElementById('sidebar-overlay');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function () {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // Terminal command callback
        this.terminal.onCommand = function (cmd) {
            self._onCommand(cmd);
        };
    };

    LessonManager.prototype.startLesson = function (lessonId) {
        var lesson = LESSONS[lessonId];
        if (!lesson) return;

        this.currentLessonId = lessonId;
        this.currentStep = 0;

        // Show lesson view, hide welcome
        document.getElementById('welcome-screen').style.display = 'none';
        var lessonView = document.getElementById('lesson-view');
        lessonView.style.display = 'flex';

        // Update active lesson in sidebar
        document.querySelectorAll('.lesson-item').forEach(function (item) {
            item.classList.remove('active');
        });
        var activeItem = document.querySelector('[data-lesson="' + lessonId + '"]');
        if (activeItem) activeItem.classList.add('active');

        // Update lesson bar
        document.getElementById('lesson-title').textContent = lesson.title;
        this._updateProgress();

        // Clear and show first instruction
        this.terminal.clear();
        this.terminal.writeLine('═══ ' + lesson.title.toUpperCase() + ' ═══', 'system');
        this.terminal.writeLine('');
        this._showStep();
        this.terminal.focus();

        // Close mobile sidebar
        var sidebar = document.getElementById('playground-sidebar');
        var overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    };

    LessonManager.prototype._showStep = function () {
        var lesson = LESSONS[this.currentLessonId];
        if (!lesson) return;
        var step = lesson.steps[this.currentStep];
        if (!step) return;

        this.terminal.writeLine(step.instruction, 'instruction');
    };

    LessonManager.prototype._onCommand = function (cmd) {
        if (!this.currentLessonId) return;

        var lesson = LESSONS[this.currentLessonId];
        var step = lesson.steps[this.currentStep];
        if (!step) return;

        if (cmd.trim() === 'hint') {
            this.terminal.writeLine('💡 Hint: ' + step.hint, 'hint');
            return;
        }

        if (cmd.trim() === 'skip') {
            this.currentStep++;
            if (this.currentStep >= lesson.steps.length) {
                this._completeLesson();
            } else {
                this._updateProgress();
                this.terminal.writeLine('');
                this._showStep();
            }
            return;
        }

        if (step.validate(cmd)) {
            if (step.isComplete) {
                this._completeLesson();
                return;
            }
            this.currentStep++;
            this._updateProgress();

            if (this.currentStep >= lesson.steps.length) {
                this._completeLesson();
            } else {
                this.terminal.writeLine('');
                this.terminal.writeLine('✓ Correct!', 'success');
                this.terminal.writeLine('');
                this._showStep();
            }
        }
    };

    LessonManager.prototype._updateProgress = function () {
        var lesson = LESSONS[this.currentLessonId];
        if (!lesson) return;

        var total = lesson.steps.length;
        var pct = Math.round((this.currentStep / total) * 100);

        document.getElementById('lesson-step-text').textContent = 'Step ' + (this.currentStep + 1) + ' / ' + total;
        document.getElementById('lesson-progress').style.width = pct + '%';
    };

    LessonManager.prototype._completeLesson = function () {
        this.completedLessons[this.currentLessonId] = true;
        localStorage.setItem('playground_completed', JSON.stringify(this.completedLessons));

        this.terminal.writeLine('');
        this.terminal.writeLine('════════════════════════════════════════', 'success');
        this.terminal.writeLine(' 🏆 Lesson Complete!', 'success');
        this.terminal.writeLine('════════════════════════════════════════', 'success');
        this.terminal.writeLine('');
        this.terminal.writeLine('You can continue exploring freely, or pick another lesson from the sidebar.', 'system');
        this.terminal.writeLine('Type "hint" for help or "help" to see all available commands.', 'system');

        document.getElementById('lesson-progress').style.width = '100%';
        document.getElementById('lesson-step-text').textContent = 'Complete!';

        this._updateSidebarStatus();
    };

    LessonManager.prototype._updateSidebarStatus = function () {
        var self = this;
        Object.keys(LESSONS).forEach(function (id) {
            var statusEl = document.getElementById('status-' + id);
            if (statusEl) {
                if (self.completedLessons[id]) {
                    statusEl.textContent = '✓';
                    statusEl.className = 'lesson-status lesson-status--done';
                    var btn = document.querySelector('[data-lesson="' + id + '"]');
                    if (btn) btn.classList.add('completed');
                }
            }
        });
    };

    // --- Initialize Playground ---
    document.addEventListener('DOMContentLoaded', function () {
        var outputEl = document.getElementById('terminal-output');
        var inputEl = document.getElementById('terminal-input');
        var promptEl = document.getElementById('terminal-prompt');

        if (!outputEl || !inputEl || !promptEl) return;

        var terminal = new window.Terminal(outputEl, inputEl, promptEl);
        var manager = new LessonManager();
        manager.init(terminal);

        // Focus input on click anywhere in terminal area
        document.querySelector('.playground-terminal-wrapper').addEventListener('click', function () {
            inputEl.focus();
        });
    });
})();
