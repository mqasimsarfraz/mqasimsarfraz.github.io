/* ============================================
   Terminal Engine for Playground
   Virtual file system + command execution
   ============================================ */

(function () {
    'use strict';

    // --- Virtual File System ---
    class VirtualFS {
        constructor() {
            this.files = {};
            this._buildDefaultFS();
        }

        _buildDefaultFS() {
            const defaults = {
                '/home/learner': { type: 'dir' },
                '/home/learner/readme.txt': { type: 'file', content: 'Welcome to the Linux playground!\nExplore, learn, and have fun.\n' },
                '/home/learner/notes': { type: 'dir' },
                '/home/learner/notes/todo.txt': { type: 'file', content: 'Learn Linux basics\nLearn Docker\nLearn Kubernetes\n' },
                '/home/learner/projects': { type: 'dir' },
                '/home/learner/projects/hello.sh': { type: 'file', content: '#!/bin/bash\necho "Hello, World!"\n', mode: '755' },
                '/home/learner/projects/app': { type: 'dir' },
                '/home/learner/projects/app/main.go': { type: 'file', content: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}\n' },
                '/home/learner/projects/app/Dockerfile': { type: 'file', content: 'FROM golang:1.21-alpine\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\nEXPOSE 8080\nCMD ["./server"]\n' },
                '/home/learner/projects/app/deployment.yaml': { type: 'file', content: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\n  labels:\n    app: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: my-app:latest\n        ports:\n        - containerPort: 8080\n' },
                '/home/learner/projects/app/service.yaml': { type: 'file', content: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-app-service\nspec:\n  type: ClusterIP\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n' },
                '/home/learner/data': { type: 'dir' },
                '/home/learner/data/logs.txt': { type: 'file', content: '2024-01-15 10:23:01 INFO  Server started on port 8080\n2024-01-15 10:23:05 INFO  Connected to database\n2024-01-15 10:24:12 WARN  High memory usage detected\n2024-01-15 10:25:00 ERROR Connection timeout to upstream\n2024-01-15 10:25:01 INFO  Retrying connection...\n2024-01-15 10:25:03 INFO  Connection restored\n2024-01-15 10:30:00 INFO  Health check passed\n2024-01-15 10:35:00 ERROR DNS resolution failed for api.example.com\n2024-01-15 10:35:01 WARN  Falling back to cached response\n2024-01-15 10:40:00 INFO  Scheduled backup completed\n' },
                '/home/learner/data/users.csv': { type: 'file', content: 'name,email,role\nAlice,alice@example.com,admin\nBob,bob@example.com,developer\nCarol,carol@example.com,developer\nDave,dave@example.com,ops\nEve,eve@example.com,security\n' },
                '/home/learner/data/config.json': { type: 'file', content: '{\n  "app": "my-service",\n  "port": 8080,\n  "database": {\n    "host": "db.example.com",\n    "port": 5432\n  },\n  "cache": {\n    "enabled": true,\n    "ttl": 300\n  }\n}\n' },
                '/etc': { type: 'dir' },
                '/etc/hostname': { type: 'file', content: 'playground\n' },
                '/etc/os-release': { type: 'file', content: 'NAME="Playground Linux"\nVERSION="1.0"\nID=playground\n' },
                '/tmp': { type: 'dir' },
                '/var': { type: 'dir' },
                '/var/log': { type: 'dir' },
                '/var/log/syslog': { type: 'file', content: 'Jan 15 10:00:00 playground kernel: Linux version 6.1.0\nJan 15 10:00:01 playground systemd: Started playground.\n' },
            };

            for (const [path, info] of Object.entries(defaults)) {
                this.files[path] = { ...info, mode: info.mode || (info.type === 'dir' ? '755' : '644') };
            }
        }

        _normalizePath(path, cwd) {
            if (!path.startsWith('/')) {
                path = cwd + '/' + path;
            }
            const parts = path.split('/').filter(Boolean);
            const resolved = [];
            for (const part of parts) {
                if (part === '.') continue;
                if (part === '..') { resolved.pop(); continue; }
                resolved.push(part);
            }
            return '/' + resolved.join('/');
        }

        exists(path, cwd) {
            const p = this._normalizePath(path, cwd);
            return p in this.files;
        }

        get(path, cwd) {
            const p = this._normalizePath(path, cwd);
            return this.files[p] || null;
        }

        isDir(path, cwd) {
            const node = this.get(path, cwd);
            return node && node.type === 'dir';
        }

        listDir(path, cwd) {
            const dirPath = this._normalizePath(path, cwd);
            if (!this.isDir(path, cwd) && dirPath !== '/') return null;

            const entries = [];
            const prefix = dirPath === '/' ? '/' : dirPath + '/';

            for (const filePath of Object.keys(this.files)) {
                if (filePath === dirPath) continue;
                if (filePath.startsWith(prefix)) {
                    const rest = filePath.slice(prefix.length);
                    if (!rest.includes('/')) {
                        entries.push({
                            name: rest,
                            ...this.files[filePath]
                        });
                    }
                }
            }

            return entries.sort((a, b) => {
                if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
        }

        createFile(path, cwd, content) {
            const p = this._normalizePath(path, cwd);
            this.files[p] = { type: 'file', content: content || '', mode: '644' };
        }

        createDir(path, cwd) {
            const p = this._normalizePath(path, cwd);
            this.files[p] = { type: 'dir', mode: '755' };
        }

        remove(path, cwd) {
            const p = this._normalizePath(path, cwd);
            if (p in this.files) {
                delete this.files[p];
                // also remove children if dir
                for (const key of Object.keys(this.files)) {
                    if (key.startsWith(p + '/')) {
                        delete this.files[key];
                    }
                }
                return true;
            }
            return false;
        }

        copy(src, dst, cwd) {
            const srcP = this._normalizePath(src, cwd);
            const dstP = this._normalizePath(dst, cwd);
            const node = this.files[srcP];
            if (!node || node.type === 'dir') return false;
            this.files[dstP] = { ...node };
            return true;
        }

        move(src, dst, cwd) {
            if (this.copy(src, dst, cwd)) {
                const srcP = this._normalizePath(src, cwd);
                delete this.files[srcP];
                return true;
            }
            return false;
        }

        chmod(path, mode, cwd) {
            const p = this._normalizePath(path, cwd);
            if (p in this.files) {
                this.files[p].mode = mode;
                return true;
            }
            return false;
        }

        resolve(path, cwd) {
            return this._normalizePath(path, cwd);
        }
    }

    // --- Docker/K8s State ---
    class SimulatedState {
        constructor() {
            this.dockerImages = [
                { repository: 'nginx', tag: 'latest', id: 'a8281ce0b7e1', size: '187MB', created: '2 weeks ago' },
                { repository: 'alpine', tag: '3.19', id: 'c1aabb73d233', size: '7.73MB', created: '3 weeks ago' },
                { repository: 'golang', tag: '1.21-alpine', id: 'b2f403de41f4', size: '258MB', created: '1 month ago' },
                { repository: 'redis', tag: '7-alpine', id: 'd4c7a1e59c37', size: '40.7MB', created: '2 weeks ago' },
            ];
            this.dockerContainers = [];
            this.dockerNetworks = [
                { id: 'bridge0000', name: 'bridge', driver: 'bridge', scope: 'local' },
                { id: 'host00000', name: 'host', driver: 'host', scope: 'local' },
                { id: 'none00000', name: 'none', driver: 'null', scope: 'local' },
            ];
            this.dockerVolumes = [];
            this._containerCounter = 0;

            this.k8sNodes = [
                { name: 'node-1', status: 'Ready', roles: 'control-plane', age: '45d', version: 'v1.29.2' },
                { name: 'node-2', status: 'Ready', roles: 'worker', age: '45d', version: 'v1.29.2' },
                { name: 'node-3', status: 'Ready', roles: 'worker', age: '30d', version: 'v1.29.2' },
            ];
            this.k8sNamespace = 'default';
            this.k8sPods = [
                { name: 'coredns-5dd5756b68-abc12', ready: '1/1', status: 'Running', restarts: 0, age: '45d', namespace: 'kube-system', labels: { 'k8s-app': 'kube-dns' } },
            ];
            this.k8sDeployments = [];
            this.k8sServices = [
                { name: 'kubernetes', type: 'ClusterIP', clusterIP: '10.96.0.1', ports: '443/TCP', age: '45d', namespace: 'default' },
            ];
        }

        _genID(len) {
            const chars = 'abcdef0123456789';
            let result = '';
            for (let i = 0; i < (len || 12); i++) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }

        dockerRun(image, opts) {
            const name = (opts && opts.name) || image.replace(/[:/]/g, '-') + '-' + this._genID(4);
            const id = this._genID(12);
            const ports = (opts && opts.ports) || '';

            const img = this.dockerImages.find(i => i.repository === image.split(':')[0]);
            if (!img) {
                this.dockerImages.push({ repository: image.split(':')[0], tag: image.split(':')[1] || 'latest', id: this._genID(12), size: '50MB', created: 'just now' });
            }

            const container = {
                id: id,
                name: name,
                image: image,
                status: 'Up 2 seconds',
                ports: ports,
                created: 'just now',
                running: true,
                logs: `Starting ${name}...\nListening on port ${ports || '(none)'}...\nReady to serve requests.\n`
            };
            this.dockerContainers.push(container);
            return container;
        }

        dockerStop(nameOrId) {
            const c = this.dockerContainers.find(c => c.name === nameOrId || c.id.startsWith(nameOrId));
            if (c) { c.running = false; c.status = 'Exited (0) 1 second ago'; return c; }
            return null;
        }

        dockerRm(nameOrId) {
            const idx = this.dockerContainers.findIndex(c => c.name === nameOrId || c.id.startsWith(nameOrId));
            if (idx >= 0) { return this.dockerContainers.splice(idx, 1)[0]; }
            return null;
        }

        dockerCreateNetwork(name, driver) {
            const net = { id: this._genID(12), name: name, driver: driver || 'bridge', scope: 'local' };
            this.dockerNetworks.push(net);
            return net;
        }

        dockerCreateVolume(name) {
            const vol = { name: name, driver: 'local', mountpoint: '/var/lib/docker/volumes/' + name + '/_data' };
            this.dockerVolumes.push(vol);
            return vol;
        }

        k8sCreateDeployment(name, image, replicas) {
            replicas = replicas || 1;
            const dep = { name: name, ready: replicas + '/' + replicas, upToDate: replicas, available: replicas, age: '0s', namespace: this.k8sNamespace };
            this.k8sDeployments.push(dep);

            for (let i = 0; i < replicas; i++) {
                this.k8sPods.push({
                    name: name + '-' + this._genID(5) + '-' + this._genID(5),
                    ready: '1/1',
                    status: 'Running',
                    restarts: 0,
                    age: '0s',
                    namespace: this.k8sNamespace,
                    image: image,
                    labels: { app: name },
                    containers: [{ name: name, image: image, ports: [{ containerPort: 8080 }] }],
                    logs: `Starting ${name}...\nServer listening on :8080\nReady to accept connections.\n`
                });
            }
            return dep;
        }

        k8sScale(depName, replicas) {
            const dep = this.k8sDeployments.find(d => d.name === depName);
            if (!dep) return null;

            const currentPods = this.k8sPods.filter(p => p.labels && p.labels.app === depName && p.namespace === this.k8sNamespace);
            const diff = replicas - currentPods.length;

            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    this.k8sPods.push({
                        name: depName + '-' + this._genID(5) + '-' + this._genID(5),
                        ready: '1/1', status: 'Running', restarts: 0, age: '0s',
                        namespace: this.k8sNamespace, labels: { app: depName },
                        image: currentPods[0] ? currentPods[0].image : 'unknown',
                        logs: `Starting ${depName}...\nReady.\n`
                    });
                }
            } else if (diff < 0) {
                let toRemove = Math.abs(diff);
                this.k8sPods = this.k8sPods.filter(p => {
                    if (toRemove > 0 && p.labels && p.labels.app === depName && p.namespace === this.k8sNamespace) {
                        toRemove--;
                        return false;
                    }
                    return true;
                });
            }

            dep.ready = replicas + '/' + replicas;
            dep.upToDate = replicas;
            dep.available = replicas;
            return dep;
        }

        k8sExpose(depName, port, targetPort, svcType) {
            const svc = {
                name: depName + '-service',
                type: svcType || 'ClusterIP',
                clusterIP: '10.96.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                ports: port + ':' + targetPort + '/TCP',
                age: '0s',
                namespace: this.k8sNamespace,
                selector: { app: depName }
            };
            this.k8sServices.push(svc);
            return svc;
        }

        k8sDelete(resource, name) {
            if (resource === 'pod') {
                const idx = this.k8sPods.findIndex(p => p.name === name);
                if (idx >= 0) return this.k8sPods.splice(idx, 1)[0];
            } else if (resource === 'deployment') {
                const idx = this.k8sDeployments.findIndex(d => d.name === name);
                if (idx >= 0) {
                    this.k8sPods = this.k8sPods.filter(p => !(p.labels && p.labels.app === name));
                    return this.k8sDeployments.splice(idx, 1)[0];
                }
            } else if (resource === 'service' || resource === 'svc') {
                const idx = this.k8sServices.findIndex(s => s.name === name);
                if (idx >= 0) return this.k8sServices.splice(idx, 1)[0];
            }
            return null;
        }
    }

    // --- Terminal Engine ---
    class Terminal {
        constructor(outputEl, inputEl, promptEl) {
            this.outputEl = outputEl;
            this.inputEl = inputEl;
            this.promptEl = promptEl;
            this.fs = new VirtualFS();
            this.state = new SimulatedState();
            this.cwd = '/home/learner';
            this.history = [];
            this.historyIndex = -1;
            this.onCommand = null; // callback for lesson validation

            this._setupInput();
            this._updatePrompt();
        }

        _setupInput() {
            const self = this;
            this.inputEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    const cmd = self.inputEl.value.trim();
                    if (cmd) {
                        self.history.push(cmd);
                        self.historyIndex = self.history.length;
                        self._echoCommand(cmd);
                        self.inputEl.value = '';
                        self.execute(cmd);
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (self.historyIndex > 0) {
                        self.historyIndex--;
                        self.inputEl.value = self.history[self.historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (self.historyIndex < self.history.length - 1) {
                        self.historyIndex++;
                        self.inputEl.value = self.history[self.historyIndex];
                    } else {
                        self.historyIndex = self.history.length;
                        self.inputEl.value = '';
                    }
                }
            });
        }

        _updatePrompt() {
            const shortCwd = this.cwd.replace('/home/learner', '~');
            this.promptEl.textContent = 'learner@playground:' + shortCwd + '$';
        }

        _echoCommand(cmd) {
            const shortCwd = this.cwd.replace('/home/learner', '~');
            this.writeLine('learner@playground:' + shortCwd + '$ ' + cmd, '');
        }

        writeLine(text, cssClass) {
            const line = document.createElement('div');
            line.className = 'terminal-output-line' + (cssClass ? ' ' + cssClass : '');
            line.textContent = text;
            this.outputEl.appendChild(line);
            this.outputEl.scrollTop = this.outputEl.scrollHeight;
        }

        writeHTML(html, cssClass) {
            const line = document.createElement('div');
            line.className = 'terminal-output-line' + (cssClass ? ' ' + cssClass : '');
            line.innerHTML = html;
            this.outputEl.appendChild(line);
            this.outputEl.scrollTop = this.outputEl.scrollHeight;
        }

        clear() {
            this.outputEl.innerHTML = '';
        }

        focus() {
            this.inputEl.focus();
        }

        execute(cmdStr) {
            const parts = this._parse(cmdStr);
            if (parts.length === 0) return;

            const cmd = parts[0];
            const args = parts.slice(1);

            const handler = this.commands[cmd];
            if (handler) {
                handler.call(this, args, cmdStr);
            } else {
                this.writeLine(cmd + ': command not found', 'error');
            }

            this._updatePrompt();

            if (this.onCommand) {
                this.onCommand(cmdStr);
            }
        }

        _parse(str) {
            const parts = [];
            let current = '';
            let inQuote = false;
            let quoteChar = '';

            for (let i = 0; i < str.length; i++) {
                const ch = str[i];
                if (inQuote) {
                    if (ch === quoteChar) { inQuote = false; }
                    else { current += ch; }
                } else if (ch === '"' || ch === "'") {
                    inQuote = true;
                    quoteChar = ch;
                } else if (ch === ' ' || ch === '\t') {
                    if (current) { parts.push(current); current = ''; }
                } else {
                    current += ch;
                }
            }
            if (current) parts.push(current);
            return parts;
        }

        get commands() {
            return {
                help: this._cmdHelp,
                clear: this._cmdClear,
                pwd: this._cmdPwd,
                ls: this._cmdLs,
                cd: this._cmdCd,
                cat: this._cmdCat,
                echo: this._cmdEcho,
                touch: this._cmdTouch,
                mkdir: this._cmdMkdir,
                rm: this._cmdRm,
                cp: this._cmdCp,
                mv: this._cmdMv,
                head: this._cmdHead,
                tail: this._cmdTail,
                grep: this._cmdGrep,
                wc: this._cmdWc,
                chmod: this._cmdChmod,
                whoami: this._cmdWhoami,
                hostname: this._cmdHostname,
                date: this._cmdDate,
                uname: this._cmdUname,
                man: this._cmdMan,
                history: this._cmdHistory,
                tree: this._cmdTree,
                // Docker commands
                docker: this._cmdDocker,
                // Kubernetes commands
                kubectl: this._cmdKubectl,
            };
        }

        // --- Linux Commands ---

        _cmdHelp() {
            this.writeLine('Available commands:', 'system');
            this.writeLine('');
            this.writeLine('  Linux:     ls, cd, pwd, cat, echo, touch, mkdir, rm, cp, mv', '');
            this.writeLine('             head, tail, grep, wc, chmod, whoami, hostname, date', '');
            this.writeLine('             uname, man, history, tree, clear, help', '');
            this.writeLine('');
            this.writeLine('  Docker:    docker [images|ps|run|stop|rm|pull|build|exec|', '');
            this.writeLine('                     logs|inspect|network|volume]', '');
            this.writeLine('');
            this.writeLine('  K8s:       kubectl [get|describe|create|scale|expose|logs|', '');
            this.writeLine('                      exec|apply|delete]', '');
            this.writeLine('');
            this.writeLine('Type "man <command>" for help on a specific command.', 'system');
        }

        _cmdClear() {
            this.clear();
        }

        _cmdPwd() {
            this.writeLine(this.cwd);
        }

        _cmdLs(args) {
            const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
            const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
            const target = args.filter(a => !a.startsWith('-'))[0] || '.';

            const path = target === '.' ? this.cwd : target;
            const entries = this.fs.listDir(path, this.cwd);

            if (entries === null) {
                this.writeLine('ls: cannot access \'' + target + '\': No such file or directory', 'error');
                return;
            }

            if (longFormat) {
                this.writeLine('total ' + entries.length);
                if (showAll) {
                    this.writeLine('drwxr-xr-x  .  .');
                    this.writeLine('drwxr-xr-x  .  ..');
                }
                entries.forEach(function (e) {
                    const perm = e.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
                    const size = e.content ? e.content.length : 4096;
                    const pad = function (s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; };
                    this.writeLine(perm + '  learner learner  ' + pad(size, 6) + '  ' + e.name + (e.type === 'dir' ? '/' : ''));
                }.bind(this));
            } else {
                const names = entries.map(function (e) { return e.type === 'dir' ? e.name + '/' : e.name; });
                if (showAll) names.unshift('.', '..');
                this.writeLine(names.join('  '));
            }
        }

        _cmdCd(args) {
            const target = args[0] || '/home/learner';
            let newPath;

            if (target === '~') {
                newPath = '/home/learner';
            } else if (target === '-') {
                newPath = this._prevCwd || this.cwd;
            } else {
                newPath = this.fs.resolve(target, this.cwd);
            }

            if (this.fs.isDir(newPath, '/') || newPath === '/') {
                this._prevCwd = this.cwd;
                this.cwd = newPath;
            } else if (this.fs.exists(newPath, '/')) {
                this.writeLine('cd: not a directory: ' + target, 'error');
            } else {
                this.writeLine('cd: no such file or directory: ' + target, 'error');
            }
        }

        _cmdCat(args) {
            if (args.length === 0) { this.writeLine('cat: missing operand', 'error'); return; }
            const node = this.fs.get(args[0], this.cwd);
            if (!node) { this.writeLine('cat: ' + args[0] + ': No such file or directory', 'error'); return; }
            if (node.type === 'dir') { this.writeLine('cat: ' + args[0] + ': Is a directory', 'error'); return; }
            node.content.split('\n').forEach(function (line) { this.writeLine(line); }.bind(this));
        }

        _cmdEcho(args, cmdStr) {
            // Support redirection
            const redirectIdx = cmdStr.indexOf('>');
            if (redirectIdx >= 0) {
                const append = cmdStr[redirectIdx + 1] === '>';
                const afterRedirect = cmdStr.slice(redirectIdx + (append ? 2 : 1)).trim();
                const fileName = afterRedirect.split(/\s+/)[0];
                const textPart = cmdStr.slice(cmdStr.indexOf(' ') + 1, redirectIdx).trim().replace(/^["']|["']$/g, '');

                if (append && this.fs.exists(fileName, this.cwd)) {
                    const node = this.fs.get(fileName, this.cwd);
                    node.content += textPart + '\n';
                } else {
                    this.fs.createFile(fileName, this.cwd, textPart + '\n');
                }
                return;
            }

            const text = args.join(' ').replace(/^["']|["']$/g, '');
            this.writeLine(text);
        }

        _cmdTouch(args) {
            if (args.length === 0) { this.writeLine('touch: missing operand', 'error'); return; }
            args.forEach(function (f) {
                if (!this.fs.exists(f, this.cwd)) {
                    this.fs.createFile(f, this.cwd, '');
                }
            }.bind(this));
        }

        _cmdMkdir(args) {
            if (args.length === 0) { this.writeLine('mkdir: missing operand', 'error'); return; }
            const recursive = args.includes('-p');
            const dirs = args.filter(function (a) { return !a.startsWith('-'); });
            dirs.forEach(function (d) {
                if (this.fs.exists(d, this.cwd)) {
                    this.writeLine('mkdir: cannot create directory \'' + d + '\': File exists', 'error');
                } else {
                    this.fs.createDir(d, this.cwd);
                }
            }.bind(this));
        }

        _cmdRm(args) {
            if (args.length === 0) { this.writeLine('rm: missing operand', 'error'); return; }
            const files = args.filter(function (a) { return !a.startsWith('-'); });
            files.forEach(function (f) {
                if (!this.fs.remove(f, this.cwd)) {
                    this.writeLine('rm: cannot remove \'' + f + '\': No such file or directory', 'error');
                }
            }.bind(this));
        }

        _cmdCp(args) {
            const files = args.filter(function (a) { return !a.startsWith('-'); });
            if (files.length < 2) { this.writeLine('cp: missing operand', 'error'); return; }
            if (!this.fs.copy(files[0], files[1], this.cwd)) {
                this.writeLine('cp: cannot copy \'' + files[0] + '\'', 'error');
            }
        }

        _cmdMv(args) {
            const files = args.filter(function (a) { return !a.startsWith('-'); });
            if (files.length < 2) { this.writeLine('mv: missing operand', 'error'); return; }
            if (!this.fs.move(files[0], files[1], this.cwd)) {
                this.writeLine('mv: cannot move \'' + files[0] + '\'', 'error');
            }
        }

        _cmdHead(args) {
            const nIdx = args.indexOf('-n');
            let n = 10;
            let file;
            if (nIdx >= 0 && args[nIdx + 1]) { n = parseInt(args[nIdx + 1]); file = args.filter(function (a, i) { return i !== nIdx && i !== nIdx + 1; })[0]; }
            else { file = args.filter(function (a) { return !a.startsWith('-'); })[0]; }
            if (!file) { this.writeLine('head: missing operand', 'error'); return; }
            const node = this.fs.get(file, this.cwd);
            if (!node) { this.writeLine('head: ' + file + ': No such file', 'error'); return; }
            node.content.split('\n').slice(0, n).forEach(function (line) { this.writeLine(line); }.bind(this));
        }

        _cmdTail(args) {
            const nIdx = args.indexOf('-n');
            let n = 10;
            let file;
            if (nIdx >= 0 && args[nIdx + 1]) { n = parseInt(args[nIdx + 1]); file = args.filter(function (a, i) { return i !== nIdx && i !== nIdx + 1; })[0]; }
            else { file = args.filter(function (a) { return !a.startsWith('-'); })[0]; }
            if (!file) { this.writeLine('tail: missing operand', 'error'); return; }
            const node = this.fs.get(file, this.cwd);
            if (!node) { this.writeLine('tail: ' + file + ': No such file', 'error'); return; }
            const lines = node.content.split('\n');
            lines.slice(Math.max(0, lines.length - n - 1)).forEach(function (line) { this.writeLine(line); }.bind(this));
        }

        _cmdGrep(args) {
            if (args.length < 2) { this.writeLine('grep: missing operand', 'error'); return; }
            const caseInsensitive = args.includes('-i');
            const showCount = args.includes('-c');
            const showLineNum = args.includes('-n');
            const filtered = args.filter(function (a) { return !a.startsWith('-'); });
            const pattern = filtered[0];
            const file = filtered[1];
            if (!file) { this.writeLine('grep: missing file operand', 'error'); return; }
            const node = this.fs.get(file, this.cwd);
            if (!node) { this.writeLine('grep: ' + file + ': No such file', 'error'); return; }
            const lines = node.content.split('\n');
            let count = 0;
            lines.forEach(function (line, i) {
                const match = caseInsensitive ?
                    line.toLowerCase().includes(pattern.toLowerCase()) :
                    line.includes(pattern);
                if (match) {
                    count++;
                    if (!showCount) {
                        this.writeLine((showLineNum ? (i + 1) + ':' : '') + line);
                    }
                }
            }.bind(this));
            if (showCount) this.writeLine(String(count));
        }

        _cmdWc(args) {
            const file = args.filter(function (a) { return !a.startsWith('-'); })[0];
            if (!file) { this.writeLine('wc: missing operand', 'error'); return; }
            const node = this.fs.get(file, this.cwd);
            if (!node) { this.writeLine('wc: ' + file + ': No such file', 'error'); return; }
            const lines = node.content.split('\n').length - 1;
            const words = node.content.split(/\s+/).filter(Boolean).length;
            const chars = node.content.length;
            this.writeLine('  ' + lines + '  ' + words + '  ' + chars + ' ' + file);
        }

        _cmdChmod(args) {
            if (args.length < 2) { this.writeLine('chmod: missing operand', 'error'); return; }
            if (!this.fs.chmod(args[1], args[0], this.cwd)) {
                this.writeLine('chmod: cannot access \'' + args[1] + '\': No such file', 'error');
            }
        }

        _cmdWhoami() { this.writeLine('learner'); }

        _cmdHostname() { this.writeLine('playground'); }

        _cmdDate() { this.writeLine(new Date().toString()); }

        _cmdUname(args) {
            if (args.includes('-a')) {
                this.writeLine('Linux playground 6.1.0-playground #1 SMP x86_64 GNU/Linux');
            } else {
                this.writeLine('Linux');
            }
        }

        _cmdHistory() {
            this.history.forEach(function (cmd, i) {
                this.writeLine('  ' + (i + 1) + '  ' + cmd);
            }.bind(this));
        }

        _cmdTree(args) {
            const target = args.filter(function (a) { return !a.startsWith('-'); })[0] || '.';
            const basePath = target === '.' ? this.cwd : this.fs.resolve(target, this.cwd);

            if (!this.fs.isDir(basePath, '/') && basePath !== '/') {
                this.writeLine('tree: \'' + target + '\' is not a directory', 'error');
                return;
            }

            const basename = basePath.split('/').pop() || '/';
            this.writeLine(basename + '/');
            this._printTree(basePath, '');
        }

        _printTree(dirPath, prefix) {
            const entries = this.fs.listDir(dirPath, '/') || [];
            entries.forEach(function (entry, i) {
                const isLast = i === entries.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const name = entry.type === 'dir' ? entry.name + '/' : entry.name;
                this.writeLine(prefix + connector + name);
                if (entry.type === 'dir') {
                    const childPrefix = prefix + (isLast ? '    ' : '│   ');
                    this._printTree(this.fs.resolve(dirPath + '/' + entry.name, '/'), childPrefix);
                }
            }.bind(this));
        }

        _cmdMan(args) {
            const manPages = {
                ls: 'ls [options] [dir]  - List directory contents.\n  -l  Long format\n  -a  Show hidden files\n  -la Both long format and hidden files',
                cd: 'cd [dir]  - Change directory.\n  cd ~   Go to home directory\n  cd ..  Go up one level\n  cd -   Go to previous directory',
                cat: 'cat <file>  - Display file contents.',
                pwd: 'pwd  - Print current working directory.',
                echo: 'echo <text>  - Print text.\n  echo "text" > file   Write to file\n  echo "text" >> file  Append to file',
                touch: 'touch <file>  - Create an empty file.',
                mkdir: 'mkdir <dir>  - Create a directory.\n  -p  Create parent directories as needed',
                rm: 'rm <file>  - Remove files.\n  -r  Remove directories recursively',
                cp: 'cp <src> <dst>  - Copy a file.',
                mv: 'mv <src> <dst>  - Move/rename a file.',
                grep: 'grep <pattern> <file>  - Search for patterns.\n  -i  Case insensitive\n  -c  Count matches\n  -n  Show line numbers',
                head: 'head [-n N] <file>  - Show first N lines (default 10).',
                tail: 'tail [-n N] <file>  - Show last N lines (default 10).',
                wc: 'wc <file>  - Count lines, words, and characters.',
                chmod: 'chmod <mode> <file>  - Change file permissions.\n  Example: chmod 755 script.sh',
                docker: 'docker <subcommand>  - Manage containers.\n  images    List images\n  ps        List containers (-a for all)\n  run       Run a container\n  stop      Stop a container\n  rm        Remove a container\n  build     Build an image\n  pull      Pull an image\n  exec      Execute command in container\n  logs      View container logs\n  inspect   Inspect a container\n  network   Manage networks\n  volume    Manage volumes',
                kubectl: 'kubectl <subcommand>  - Manage Kubernetes resources.\n  get        List resources\n  describe   Show resource details\n  create     Create resources\n  scale      Scale deployments\n  expose     Create services\n  logs       View pod logs\n  exec       Execute in pod\n  apply      Apply YAML files\n  delete     Delete resources',
            };

            const cmd = args[0];
            if (!cmd) { this.writeLine('man: what manual page do you want?', 'error'); return; }
            if (manPages[cmd]) {
                manPages[cmd].split('\n').forEach(function (line) { this.writeLine(line); }.bind(this));
            } else {
                this.writeLine('No manual entry for ' + cmd, 'error');
            }
        }

        // --- Docker Commands ---

        _cmdDocker(args) {
            if (args.length === 0) { this.writeLine('Usage: docker <command>', 'error'); return; }
            const sub = args[0];
            const rest = args.slice(1);

            switch (sub) {
                case 'images': this._dockerImages(rest); break;
                case 'ps': this._dockerPs(rest); break;
                case 'run': this._dockerRun(rest); break;
                case 'stop': this._dockerStop(rest); break;
                case 'rm': this._dockerRm(rest); break;
                case 'pull': this._dockerPull(rest); break;
                case 'build': this._dockerBuild(rest); break;
                case 'exec': this._dockerExec(rest); break;
                case 'logs': this._dockerLogs(rest); break;
                case 'inspect': this._dockerInspect(rest); break;
                case 'network': this._dockerNetwork(rest); break;
                case 'volume': this._dockerVolume(rest); break;
                default: this.writeLine('docker: \'' + sub + '\' is not a docker command', 'error');
            }
        }

        _dockerImages() {
            const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
            this.writeLine(pad('REPOSITORY', 20) + pad('TAG', 15) + pad('IMAGE ID', 15) + pad('CREATED', 15) + 'SIZE');
            this.state.dockerImages.forEach(function (img) {
                this.writeLine(pad(img.repository, 20) + pad(img.tag, 15) + pad(img.id, 15) + pad(img.created, 15) + img.size);
            }.bind(this));
        }

        _dockerPs(args) {
            const all = args.includes('-a');
            const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
            this.writeLine(pad('CONTAINER ID', 15) + pad('IMAGE', 20) + pad('STATUS', 25) + pad('PORTS', 15) + 'NAMES');
            this.state.dockerContainers.forEach(function (c) {
                if (!all && !c.running) return;
                this.writeLine(pad(c.id, 15) + pad(c.image, 20) + pad(c.status, 25) + pad(c.ports || '', 15) + c.name);
            }.bind(this));
        }

        _dockerRun(args) {
            const detach = args.includes('-d');
            let name = null;
            let ports = '';
            let image = null;

            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--name' && args[i + 1]) { name = args[i + 1]; i++; }
                else if (args[i] === '-p' && args[i + 1]) { ports = args[i + 1]; i++; }
                else if (!args[i].startsWith('-')) { image = args[i]; }
            }

            if (!image) { this.writeLine('docker run: requires an image', 'error'); return; }

            const c = this.state.dockerRun(image, { name: name, ports: ports });
            if (detach) {
                this.writeLine(c.id);
            } else {
                this.writeLine(c.id);
                this.writeLine('Container ' + c.name + ' started.', 'system');
            }
        }

        _dockerStop(args) {
            if (args.length === 0) { this.writeLine('docker stop: requires container name or ID', 'error'); return; }
            const c = this.state.dockerStop(args[0]);
            if (c) { this.writeLine(args[0]); }
            else { this.writeLine('Error: No such container: ' + args[0], 'error'); }
        }

        _dockerRm(args) {
            if (args.length === 0) { this.writeLine('docker rm: requires container name or ID', 'error'); return; }
            const c = this.state.dockerRm(args[0]);
            if (c) { this.writeLine(args[0]); }
            else { this.writeLine('Error: No such container: ' + args[0], 'error'); }
        }

        _dockerPull(args) {
            if (args.length === 0) { this.writeLine('docker pull: requires an image', 'error'); return; }
            const img = args[0];
            const tag = img.includes(':') ? img.split(':')[1] : 'latest';
            const repo = img.split(':')[0];
            this.writeLine('Pulling ' + repo + ':' + tag + '...');
            this.writeLine('Digest: sha256:' + this.state._genID(64));
            this.writeLine('Status: Downloaded newer image for ' + repo + ':' + tag);
            if (!this.state.dockerImages.find(function (i) { return i.repository === repo && i.tag === tag; })) {
                this.state.dockerImages.push({ repository: repo, tag: tag, id: this.state._genID(12), size: '50MB', created: 'just now' });
            }
        }

        _dockerBuild(args) {
            this.writeLine('Sending build context to Docker daemon  2.048kB');
            this.writeLine('Step 1/6 : FROM golang:1.21-alpine');
            this.writeLine(' ---> b2f403de41f4');
            this.writeLine('Step 2/6 : WORKDIR /app');
            this.writeLine(' ---> Running in ' + this.state._genID(12));
            this.writeLine('Step 3/6 : COPY . .');
            this.writeLine('Step 4/6 : RUN go build -o server .');
            this.writeLine('Step 5/6 : EXPOSE 8080');
            this.writeLine('Step 6/6 : CMD ["./server"]');
            const newId = this.state._genID(12);
            this.writeLine('Successfully built ' + newId);

            // check for -t tag
            const tIdx = args.indexOf('-t');
            if (tIdx >= 0 && args[tIdx + 1]) {
                const tag = args[tIdx + 1];
                const parts = tag.split(':');
                this.state.dockerImages.push({ repository: parts[0], tag: parts[1] || 'latest', id: newId, size: '95MB', created: 'just now' });
                this.writeLine('Successfully tagged ' + tag);
            }
        }

        _dockerExec(args) {
            const nameOrId = args.filter(function (a) { return !a.startsWith('-'); })[0];
            if (!nameOrId) { this.writeLine('docker exec: requires container', 'error'); return; }
            const c = this.state.dockerContainers.find(function (c) { return c.name === nameOrId || c.id.startsWith(nameOrId); });
            if (!c) { this.writeLine('Error: No such container: ' + nameOrId, 'error'); return; }
            if (!c.running) { this.writeLine('Error: Container ' + nameOrId + ' is not running', 'error'); return; }
            this.writeLine('(simulated exec in ' + c.name + ')', 'system');
        }

        _dockerLogs(args) {
            const nameOrId = args.filter(function (a) { return !a.startsWith('-'); })[0];
            if (!nameOrId) { this.writeLine('docker logs: requires container', 'error'); return; }
            const c = this.state.dockerContainers.find(function (c) { return c.name === nameOrId || c.id.startsWith(nameOrId); });
            if (!c) { this.writeLine('Error: No such container: ' + nameOrId, 'error'); return; }
            c.logs.split('\n').forEach(function (line) { this.writeLine(line); }.bind(this));
        }

        _dockerInspect(args) {
            const nameOrId = args[0];
            if (!nameOrId) { this.writeLine('docker inspect: requires name or ID', 'error'); return; }
            const c = this.state.dockerContainers.find(function (c) { return c.name === nameOrId || c.id.startsWith(nameOrId); });
            if (c) {
                this.writeLine(JSON.stringify({ Id: c.id, Name: '/' + c.name, Image: c.image, State: { Running: c.running, Status: c.status }, NetworkSettings: { Ports: c.ports } }, null, 2));
                return;
            }
            this.writeLine('Error: No such object: ' + nameOrId, 'error');
        }

        _dockerNetwork(args) {
            if (args.length === 0 || args[0] === 'ls') {
                const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
                this.writeLine(pad('NETWORK ID', 15) + pad('NAME', 20) + pad('DRIVER', 10) + 'SCOPE');
                this.state.dockerNetworks.forEach(function (n) {
                    this.writeLine(pad(n.id, 15) + pad(n.name, 20) + pad(n.driver, 10) + n.scope);
                }.bind(this));
            } else if (args[0] === 'create') {
                const name = args.filter(function (a) { return !a.startsWith('-'); })[1];
                if (!name) { this.writeLine('docker network create: requires name', 'error'); return; }
                const dIdx = args.indexOf('--driver');
                const driver = dIdx >= 0 ? args[dIdx + 1] : 'bridge';
                const net = this.state.dockerCreateNetwork(name, driver);
                this.writeLine(net.id);
            }
        }

        _dockerVolume(args) {
            if (args.length === 0 || args[0] === 'ls') {
                const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
                this.writeLine(pad('DRIVER', 10) + 'VOLUME NAME');
                this.state.dockerVolumes.forEach(function (v) {
                    this.writeLine(pad(v.driver, 10) + v.name);
                }.bind(this));
            } else if (args[0] === 'create') {
                const name = args[1];
                if (!name) { this.writeLine('docker volume create: requires name', 'error'); return; }
                const vol = this.state.dockerCreateVolume(name);
                this.writeLine(vol.name);
            } else if (args[0] === 'inspect') {
                const name = args[1];
                const vol = this.state.dockerVolumes.find(function (v) { return v.name === name; });
                if (vol) { this.writeLine(JSON.stringify(vol, null, 2)); }
                else { this.writeLine('Error: No such volume: ' + name, 'error'); }
            }
        }

        // --- Kubernetes Commands ---

        _cmdKubectl(args) {
            if (args.length === 0) { this.writeLine('Usage: kubectl <command> [resource]', 'error'); return; }
            const sub = args[0];
            const rest = args.slice(1);

            switch (sub) {
                case 'get': this._kubectlGet(rest); break;
                case 'describe': this._kubectlDescribe(rest); break;
                case 'create': this._kubectlCreate(rest); break;
                case 'scale': this._kubectlScale(rest); break;
                case 'expose': this._kubectlExpose(rest); break;
                case 'logs': this._kubectlLogs(rest); break;
                case 'exec': this._kubectlExec(rest); break;
                case 'apply': this._kubectlApply(rest); break;
                case 'delete': this._kubectlDelete(rest); break;
                case 'config': this._kubectlConfig(rest); break;
                default: this.writeLine('kubectl: unknown command "' + sub + '"', 'error');
            }
        }

        _kubectlGet(args) {
            const resource = args[0];
            if (!resource) { this.writeLine('kubectl get: requires resource type', 'error'); return; }
            const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
            const ns = this.state.k8sNamespace;
            const allNs = args.includes('--all-namespaces') || args.includes('-A');
            const wide = args.includes('-o') && args.includes('wide');

            switch (resource) {
                case 'nodes':
                case 'node':
                    this.writeLine(pad('NAME', 12) + pad('STATUS', 10) + pad('ROLES', 18) + pad('AGE', 8) + 'VERSION');
                    this.state.k8sNodes.forEach(function (n) {
                        this.writeLine(pad(n.name, 12) + pad(n.status, 10) + pad(n.roles, 18) + pad(n.age, 8) + n.version);
                    }.bind(this));
                    break;
                case 'pods':
                case 'pod':
                case 'po':
                    this.writeLine(pad('NAME', 45) + pad('READY', 8) + pad('STATUS', 12) + pad('RESTARTS', 10) + 'AGE');
                    this.state.k8sPods.filter(function (p) { return allNs || p.namespace === ns; }).forEach(function (p) {
                        this.writeLine(pad(p.name, 45) + pad(p.ready, 8) + pad(p.status, 12) + pad(String(p.restarts), 10) + p.age);
                    }.bind(this));
                    break;
                case 'deployments':
                case 'deployment':
                case 'deploy':
                    this.writeLine(pad('NAME', 20) + pad('READY', 10) + pad('UP-TO-DATE', 12) + pad('AVAILABLE', 12) + 'AGE');
                    this.state.k8sDeployments.filter(function (d) { return allNs || d.namespace === ns; }).forEach(function (d) {
                        this.writeLine(pad(d.name, 20) + pad(d.ready, 10) + pad(String(d.upToDate), 12) + pad(String(d.available), 12) + d.age);
                    }.bind(this));
                    break;
                case 'services':
                case 'service':
                case 'svc':
                    this.writeLine(pad('NAME', 25) + pad('TYPE', 15) + pad('CLUSTER-IP', 18) + pad('PORTS', 15) + 'AGE');
                    this.state.k8sServices.filter(function (s) { return allNs || s.namespace === ns; }).forEach(function (s) {
                        this.writeLine(pad(s.name, 25) + pad(s.type, 15) + pad(s.clusterIP, 18) + pad(s.ports, 15) + s.age);
                    }.bind(this));
                    break;
                default:
                    this.writeLine('error: the server doesn\'t have a resource type "' + resource + '"', 'error');
            }
        }

        _kubectlDescribe(args) {
            const resource = args[0];
            const name = args[1];
            if (!resource || !name) { this.writeLine('kubectl describe: requires resource type and name', 'error'); return; }

            if (resource === 'pod' || resource === 'pods') {
                const pod = this.state.k8sPods.find(function (p) { return p.name === name; });
                if (!pod) { this.writeLine('Error from server: pods "' + name + '" not found', 'error'); return; }
                this.writeLine('Name:         ' + pod.name);
                this.writeLine('Namespace:    ' + pod.namespace);
                this.writeLine('Status:       ' + pod.status);
                this.writeLine('Labels:       ' + Object.entries(pod.labels || {}).map(function (e) { return e[0] + '=' + e[1]; }).join(', '));
                this.writeLine('Containers:');
                (pod.containers || [{ name: 'main', image: pod.image || 'unknown' }]).forEach(function (c) {
                    this.writeLine('  ' + c.name + ':');
                    this.writeLine('    Image:   ' + c.image);
                }.bind(this));
                this.writeLine('Events:       <none>');
            } else if (resource === 'deployment' || resource === 'deploy') {
                const dep = this.state.k8sDeployments.find(function (d) { return d.name === name; });
                if (!dep) { this.writeLine('Error from server: deployments "' + name + '" not found', 'error'); return; }
                this.writeLine('Name:         ' + dep.name);
                this.writeLine('Namespace:    ' + dep.namespace);
                this.writeLine('Replicas:     ' + dep.ready);
                this.writeLine('Selector:     app=' + dep.name);
            } else if (resource === 'service' || resource === 'svc') {
                const svc = this.state.k8sServices.find(function (s) { return s.name === name; });
                if (!svc) { this.writeLine('Error from server: services "' + name + '" not found', 'error'); return; }
                this.writeLine('Name:         ' + svc.name);
                this.writeLine('Type:         ' + svc.type);
                this.writeLine('IP:           ' + svc.clusterIP);
                this.writeLine('Ports:        ' + svc.ports);
                if (svc.selector) this.writeLine('Selector:     ' + Object.entries(svc.selector).map(function (e) { return e[0] + '=' + e[1]; }).join(', '));
            } else if (resource === 'node' || resource === 'nodes') {
                const node = this.state.k8sNodes.find(function (n) { return n.name === name; });
                if (!node) { this.writeLine('Error from server: nodes "' + name + '" not found', 'error'); return; }
                this.writeLine('Name:         ' + node.name);
                this.writeLine('Roles:        ' + node.roles);
                this.writeLine('Status:       ' + node.status);
                this.writeLine('Version:      ' + node.version);
                this.writeLine('OS:           Linux');
                this.writeLine('Architecture: amd64');
            }
        }

        _kubectlCreate(args) {
            if (args[0] === 'deployment') {
                const name = args[1];
                if (!name) { this.writeLine('kubectl create deployment: requires name', 'error'); return; }
                const imgIdx = args.indexOf('--image');
                const image = imgIdx >= 0 ? args[imgIdx + 1] : 'nginx:latest';
                const repIdx = args.indexOf('--replicas');
                const replicas = repIdx >= 0 ? parseInt(args[repIdx + 1]) : 1;
                this.state.k8sCreateDeployment(name, image, replicas);
                this.writeLine('deployment.apps/' + name + ' created');
            } else {
                this.writeLine('kubectl create: unsupported resource. Try "create deployment"', 'error');
            }
        }

        _kubectlScale(args) {
            let depName = null;
            let replicas = null;
            for (let i = 0; i < args.length; i++) {
                if (args[i].startsWith('deployment/')) depName = args[i].split('/')[1];
                else if (args[i] === '--replicas' && args[i + 1]) { replicas = parseInt(args[i + 1]); i++; }
                else if (args[i].startsWith('--replicas=')) replicas = parseInt(args[i].split('=')[1]);
            }
            if (!depName || replicas === null) { this.writeLine('Usage: kubectl scale deployment/<name> --replicas=N', 'error'); return; }
            const dep = this.state.k8sScale(depName, replicas);
            if (dep) { this.writeLine('deployment.apps/' + depName + ' scaled'); }
            else { this.writeLine('Error: deployment "' + depName + '" not found', 'error'); }
        }

        _kubectlExpose(args) {
            if (args[0] !== 'deployment') { this.writeLine('kubectl expose: try "expose deployment <name>"', 'error'); return; }
            const name = args[1];
            if (!name) { this.writeLine('kubectl expose: requires deployment name', 'error'); return; }
            let port = '80', targetPort = '8080', svcType = 'ClusterIP';
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--port' && args[i + 1]) port = args[i + 1];
                if (args[i] === '--target-port' && args[i + 1]) targetPort = args[i + 1];
                if (args[i] === '--type' && args[i + 1]) svcType = args[i + 1];
            }
            this.state.k8sExpose(name, port, targetPort, svcType);
            this.writeLine('service/' + name + '-service exposed');
        }

        _kubectlLogs(args) {
            const podName = args.filter(function (a) { return !a.startsWith('-'); })[0];
            if (!podName) { this.writeLine('kubectl logs: requires pod name', 'error'); return; }
            const pod = this.state.k8sPods.find(function (p) { return p.name === podName || p.name.startsWith(podName); });
            if (!pod) { this.writeLine('Error from server: pods "' + podName + '" not found', 'error'); return; }
            (pod.logs || 'No logs available.\n').split('\n').forEach(function (line) { this.writeLine(line); }.bind(this));
        }

        _kubectlExec(args) {
            const podName = args.filter(function (a) { return !a.startsWith('-') && a !== '--'; })[0];
            if (!podName) { this.writeLine('kubectl exec: requires pod name', 'error'); return; }
            const pod = this.state.k8sPods.find(function (p) { return p.name === podName; });
            if (!pod) { this.writeLine('Error from server: pods "' + podName + '" not found', 'error'); return; }
            this.writeLine('(simulated exec in pod ' + pod.name + ')', 'system');
        }

        _kubectlApply(args) {
            const fIdx = args.indexOf('-f');
            if (fIdx < 0 || !args[fIdx + 1]) { this.writeLine('kubectl apply: requires -f <file>', 'error'); return; }
            const file = args[fIdx + 1];
            const node = this.fs.get(file, this.cwd);
            if (!node) { this.writeLine('error: the path "' + file + '" does not exist', 'error'); return; }

            if (node.content.includes('kind: Deployment')) {
                const nameMatch = node.content.match(/name:\s+(\S+)/);
                const name = nameMatch ? nameMatch[1] : 'app';
                const imageMatch = node.content.match(/image:\s+(\S+)/);
                const image = imageMatch ? imageMatch[1] : 'nginx';
                const replicaMatch = node.content.match(/replicas:\s+(\d+)/);
                const replicas = replicaMatch ? parseInt(replicaMatch[1]) : 1;

                if (!this.state.k8sDeployments.find(function (d) { return d.name === name; })) {
                    this.state.k8sCreateDeployment(name, image, replicas);
                }
                this.writeLine('deployment.apps/' + name + ' configured');
            } else if (node.content.includes('kind: Service')) {
                const nameMatch = node.content.match(/name:\s+(\S+)/);
                const name = nameMatch ? nameMatch[1] : 'service';
                if (!this.state.k8sServices.find(function (s) { return s.name === name; })) {
                    this.state.k8sExpose(name.replace('-service', ''), '80', '8080');
                }
                this.writeLine('service/' + name + ' configured');
            } else {
                this.writeLine('resource configured');
            }
        }

        _kubectlDelete(args) {
            const resource = args[0];
            const name = args[1];
            if (!resource || !name) { this.writeLine('kubectl delete: requires resource type and name', 'error'); return; }
            const obj = this.state.k8sDelete(resource, name);
            if (obj) { this.writeLine(resource + ' "' + name + '" deleted'); }
            else { this.writeLine('Error from server: ' + resource + ' "' + name + '" not found', 'error'); }
        }

        _kubectlConfig(args) {
            if (args[0] === 'current-context') {
                this.writeLine('playground-cluster');
            } else if (args[0] === 'get-contexts') {
                const pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
                this.writeLine(pad('CURRENT', 10) + pad('NAME', 25) + pad('CLUSTER', 25) + 'NAMESPACE');
                this.writeLine(pad('*', 10) + pad('playground-cluster', 25) + pad('playground-cluster', 25) + 'default');
            }
        }
    }

    // Expose globally
    window.Terminal = Terminal;
})();
