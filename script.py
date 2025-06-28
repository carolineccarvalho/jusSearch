import subprocess
import sys
import time
import os

def install_package(package):
    print(f"Instalando {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def check_and_install_packages(packages):
    for pkg in packages:
        try:
            __import__(pkg)
        except ImportError:
            install_package(pkg)

def run_backend():
    print("\nIniciando backend :)")
    backend_process = subprocess.Popen([sys.executable, "main.py"])
    return backend_process

def run_frontend():
    print("\nIniciando frontend :)")
    os.chdir("autocomplete-app")

    if not os.path.exists("node_modules"):
        print("Executando npm install...")
        subprocess.check_call(["npm", "install"])

    frontend_process = subprocess.Popen(["npm", "start"])
    return frontend_process

if __name__ == "__main__":
    print("Verificando dependências do backend...")
    check_and_install_packages(["flask", "flask_cors", "requests"])

    backend = run_backend()

    time.sleep(5)

    frontend = run_frontend()

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\nEncerrando os servidores...")
        backend.terminate()
        frontend.terminate()
