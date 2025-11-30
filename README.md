# app-catalogo-livros-tsi
O presente projeto de software visa desenvolver uma aplicação web que permite que usuários organizem, consultem e gerenciem sua coleção de livros de forma simples, funcionando como um catálogo pessoal.

## Tecnologias Utilizadas

| Componente | Tecnologia |
| :--- | :--- | :--- |
| **Frontend** | **Vue.js** |
| **Backend** | **PHP** |
| **Banco de Dados** | **MySQL** |
| **Ambiente Dev**| **Node.js/npm** |

## Configuração
Para rodar este projeto web (Backend em PHP/MySQL e Frontend em Vue.js), siga os passos abaixo para configurar ambos os lados.

### Backend
O backend utiliza PHP e MySQL. Use um ambiente local como XAMPP ou WAMP para facilitar a configuração.

1. **Instalação**: Certifique-se de ter o XAMPP (ou equivalente) instalado e que os serviços Apache e MySQL estejam rodando.

2. **Localização dos Arquivos**: Coloque a pasta raiz do projeto (app-catalogo-livros-tsi/) dentro do diretório de documentos do servidor web, tipicamente a pasta htdocs do XAMPP:

    ```
    C:\xampp\htdocs\app-catalogo-livros-tsi
    ```

3. **Criação do Banco de Dados**: Crie um novo banco de dados com o nome exato: *catalogo_livros*.

4. **Execução do Setup**: Execute o script de configuração via URL no seu navegador. Este script criará as tabelas e inserirá dados de exemplo.

    ```
    http://localhost/app-catalogo-livros-tsi/api/src/Database/setup.php
    ```

### Frontend
O frontend utiliza Vue.js e é iniciado via Node Package Manager (npm).

1. Abra o terminal na raiz do projeto (app-catalogo-livros-tsi/).

2. Execute o comando para instalar ou atualizar as dependências do projeto:

    ```
    npm install
    # ou
    npm update
    ```

3. No mesmo terminal, execute o comando para iniciar o servidor de desenvolvimento do Frontend:

npm run dev

4. Acesse a aplicação no seu navegador pelo link fornecido no terminal, que geralmente é:

    ```
    http://localhost:5173
    ```