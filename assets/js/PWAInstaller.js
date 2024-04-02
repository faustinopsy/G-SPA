import I18nService from '../js/libs/I18nService.js';
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.setupButton = null;
        this.permission = false;
        this.lido = false;
        this.linguagem = new I18nService();
    }

    initialize() {
        this.setupListeners();
        this.checkAbertura();
        this.registerServiceWorker();
        this.pushPermission();
        this.pushPermission();
    }

    async pushPermission() {
        const permissionResult = await Notification.requestPermission();
        if (permissionResult !== 'granted') {
            console.warn('Permissão de notificação não concedida.');
            
        }
    }
    
      
    checkAbertura() {
        this.lido = false//localStorage.getItem('lido');
        if (!this.lido) {
            this.mostrarModalNaoFechavel();
        }
    }

    mostrarModalNaoFechavel() {
        const btn = document.createElement('button')
        btn.textContent ="notifique"
        btn.className = "w3-button"
        btn.id="btnnotifica"
        const notificationBtn = document.createElement('button')
        notificationBtn.textContent ="Autorizar notificações"
        notificationBtn.className = "w3-button"
        notificationBtn.id="notificationBtn"

        document.body.appendChild(notificationBtn);
        document.body.appendChild(btn);

        localStorage.setItem('lido', true);
        
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        const star = document.getElementById('star');
        const star2 = document.getElementById('star2');
        leftPanel.style.display = 'block';
        rightPanel.style.display = 'block';
    
        setTimeout(() => {
            leftPanel.style.transform = 'translateX(0)';
            rightPanel.style.transform = 'translateX(0)';
            star.style.transform = 'translate(-50%, -50%) scale(0.5)';
            star.style.display = 'block';
            star2.style.display = 'block';
        }, 100); 
        setTimeout(() => {
            leftPanel.style.transform = 'translateX(-100%)';
            rightPanel.style.transform = 'translateX(100%)';
            star.style.display = 'none';
            star2.style.display = 'none';
            setTimeout(() => {
                leftPanel.style.display = 'none';
                rightPanel.style.display = 'none';
            }, 500); 
        }, 2000); 
    }
    

    async setupListeners() {
        await this.linguagem.loadTranslations();
        window.addEventListener('DOMContentLoaded', () => {
            this.checkAbertura();
           
        });
        const btn = document.getElementById('btnnotifica')
        btn.addEventListener('click', () => this.notifyMe());
        const notificationBtn = document.getElementById('notificationBtn')
        notificationBtn.addEventListener('click', () => this.permitirNotificacao());
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            const installModal = document.createElement('div');
            installModal.setAttribute('id', 'installModal');
            installModal.style.zIndex = '9999';
            installModal.style.top = '100px';
            installModal.innerHTML = `
                <div class="w3-panel w3-pale-green">
                    <h2>${this.linguagem.t('install_app')}</h2>
                    <button id="installBtn" class="w3-button w3-white  ">📱 ${this.linguagem.t('install')}</button>
                    <button id="cancelInstallBtn" class="w3-button w3-white  ">❌ ${this.linguagem.t('cancel')}</button>
                    <p>${this.linguagem.t('install_prompt')}</p>
                </div>
            `;
            document.body.appendChild(installModal);

            installModal.style.display = 'block';
            document.getElementById('installBtn').addEventListener('click', () => {
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuário aceitou a instalação do PWA');
                    } else {
                        console.log('Usuário recusou a instalação do PWA');
                    }
                    this.deferredPrompt = null;
                    installModal.style.display = 'none';
                });
            });

            document.getElementById('cancelInstallBtn').addEventListener('click', () => {
                installModal.style.display = 'none';
            });
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log("appinstalled fired", evt);
        });
        
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('./sw.js')
                .then(serviceWorker => {
                    console.log('Rodando serviço: ' + serviceWorker.active);
                })
                .catch(error => {
                    console.log('Error registering the Service Worker: ' + error);
                });
        }
    }
    async notifyMe() {
        const title = prompt("Quall o Titulo?");
        const img = 'assets/img/notifica.webp';
        const text = prompt("Qual a mensagem?");
    
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        } else {
            this.permission = Notification.permission;
            if (this.permission === "granted") {
                this.showNotification(title, text, img);
            } else if (this.permission !== "denied") {
                this.permission = await Notification.requestPermission();
                console.log(permission);
                if (this.permission === "granted") {
                    console.log(this.permission);
                    this.showNotification(title, text, img);
                }
            }
        }
    }
    
    showNotification(title, text, img) {
        const options = { body: text, icon: img };
        //const notification = new Notification(title, options);
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
            });
        }
    }
    permitirNotificacao() {
        
        
        if (!Reflect.has(window, 'Notification')) {
          console.log('This browser does not support notifications.');
        } else {
          if (this.checkNotificationPromise()) {
            Notification.requestPermission().then(this.handlePermission);
          } else {
            Notification.requestPermission(this.handlePermission);
          }
        }
      };
      checkNotificationPromise() {
        try {
          Notification.requestPermission().then();
        } catch(e) {
          return false;
        }
    
        return true;
      };
      handlePermission(permission) {
        const notificationBtn = document.getElementById('notificationBtn')
        if (!Reflect.has(Notification, 'permission')) {
          Notification.permission = this.permission;
        }
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
          notificationBtn.style.display = 'block';
        } else {
          notificationBtn.style.display = 'none';
        }
      };
}

const pwaInstaller = new PWAInstaller();
window.addEventListener('load', () => {
    pwaInstaller.initialize();
});
