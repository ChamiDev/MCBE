        // Configuración inicial
        const version = "1.0.9";
        let realms = [];
        let isDragging = false;
        let offsetX, offsetY;

        // Elementos del DOM
        const launcher = document.getElementById('launcher');
        const titleBar = document.getElementById('titleBar');
        const scrollContent = document.getElementById('scrollContent');
        const errorMessage = document.getElementById('errorMessage');
        const closeBtn = document.getElementById('closeBtn');
        const btnShare = document.getElementById('btnShare');
        const btnTrash = document.getElementById('btnTrash');
        const btnAccount = document.getElementById('btnAccount');
        const btnConfig = document.getElementById('btnConfig');
        const versionLabel = document.getElementById('versionLabel');

        // Hacer la ventana arrastrable
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.className !== 'close-btn') {
                isDragging = true;
                const rect = launcher.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                launcher.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                launcher.style.left = `${e.clientX - offsetX}px`;
                launcher.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            launcher.style.cursor = 'default';
        });

        // Animación de cierre
        function applyShrinkAnimation(callback, bgColor) {
            document.body.style.backgroundColor = bgColor;
            
            launcher.style.animation = 'none';
            launcher.style.transform = 'scale(1)';
            launcher.style.opacity = '1';

            // Trigger reflow
            void launcher.offsetWidth;

            launcher.style.animation = 'shrinkOut 0.3s forwards';

            if (callback) {
                setTimeout(callback, 300);
            }
        }

        // Botón de cerrar - ahora redirige a http://action_exit
        closeBtn.addEventListener('click', () => {
            applyShrinkAnimation(() => {
                window.location.href = 'http://action_exit';
            }, '#000000');
        });

        // Botones del footer
        btnShare.addEventListener('click', () => {
            window.open('https://chamidev.github.io/MCBE/launcher', '_blank');
        });

        [btnTrash, btnAccount, btnConfig].forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Funcionalidad próximamente disponible');
            });
        });

        // Función para crear botón de Minecraft (simplificada para solo el logo)
        function createMinecraftButton() {
            const button = document.createElement('div');
            button.className = 'minecraft-button';
            
            const icon = document.createElement('img');
            icon.className = 'minecraft-icon';
            icon.src = 'https://eu-um2025.renderforest.com/u25148551/visuals/669dec74-556f-42be-a458-a6f22b2ce555.png';
            icon.alt = 'Minecraft';
            
            button.appendChild(icon);
            
            button.addEventListener('click', () => {
                window.location.href = 'minecraft://';
            });
            
            return button;
        }

        // Función para crear botón de Realm
        function createRealmButton(realm) {
            const button = document.createElement('div');
            button.className = 'realm-button';
            
            const img = document.createElement('img');
            img.className = 'realm-image';
            img.src = `https://raw.githubusercontent.com/ChamiDev/RealmLauncher/main/assets/${realm.png}`;
            img.alt = realm.name;
            
            img.onerror = () => {
                // Si falla la imagen, mostrar un botón simple con texto
                button.innerHTML = '';
                button.textContent = `UNIRSE A ${realm.name.toUpperCase()}`;
                button.style.justifyContent = 'center';
                button.style.color = 'white';
                button.style.fontWeight = 'bold';
            };
            
            const name = document.createElement('div');
            name.className = 'realm-name';
            name.textContent = realm.name;
            
            button.appendChild(img);
            button.appendChild(name);
            
            button.addEventListener('click', () => {
                applyShrinkAnimation(() => {
                    window.location.href = `minecraft://acceptRealmInvite?inviteID=${realm.id}`;
                }, '#dc3c3c');
            });
            
            return button;
        }

        // Obtener datos de los realms
        async function fetchRealmsData() {
            try {
                const response = await fetch('https://chamidev.github.io/RealmID.js');
                const text = await response.text();
                
                // Parsear los realms del archivo JS
                const realmPattern = /const\s+([A-Z_]+)_ID\s*=\s*"([^"]+)";\s*const\s+\1_PNG\s*=\s*"([^"]+)";/g;
                let match;
                
                while ((match = realmPattern.exec(text)) !== null) {
                    const realmName = match[1].replace(/_/g, ' ');
                    const formattedName = realmName.toLowerCase()
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    
                    realms.push({
                        name: formattedName,
                        id: match[2],
                        png: match[3]
                    });
                }
                
                return realms.length > 0;
            } catch (error) {
                console.error('Error fetching realms data:', error);
                return false;
            }
        }

        // Inicializar la aplicación
        async function init() {
            versionLabel.textContent = `v${version}`;
            
            // Añadir botón de Minecraft
            scrollContent.appendChild(createMinecraftButton());
            
            // Obtener y mostrar los realms
            const hasRealms = await fetchRealmsData();
            
            if (hasRealms) {
                realms.forEach(realm => {
                    scrollContent.appendChild(createRealmButton(realm));
                });
            } else {
                errorMessage.style.display = 'block';
            }
        }

        // Iniciar la aplicación cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', init);