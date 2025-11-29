# Projeto-Dsin

## 📘 Descrição do Projeto

 Esse é um projeto academico desenvolvido para uma empresa que seu trabalho é ajudar no trânsito diário, esse sistema criado está voltado para digitalizar talões manuais feitos por agentes de trânsito utilizando:
 ASP.Net 8
 React Native + Expo Go
 Postgresql

### 🌟 O que o projeto entrega / quais são os objetivos principais
- Back-end implementado (C#, APIs, lógica de negócio, etc).  
- Front-end construído com Expo / React Native, pronto para rodar em ambiente mobile.  
- Estrutura organizada para facilitar colaboração entre os membros do time.  

---

## 👥 Participantes

| Nome | RA |
|------|--------|
| Vinicius Da Silva Gomes | 2010424 |
| Gabriel Fante Javarotti | 1990554 |
| Guilherme Dalanora Dos Santos | 1991839 |
| Leonardo Lopes | 2010503 |
| Miguel Guarnetti | 1999154 |
| João Pedro Pereira Guerra | 2006484 |

---

## 🗂️ Estrutura de Pastas

```
├── Front-End/ → Aplicativo mobile (Expo / React Native)
│ ├── app/ → Telas e rotas
│ ├── assets/ → Mídia estática, fontes, imagens
│ ├── components/ → Componentes reutilizáveis
│ ├── constants/ → Configurações estáticas
│ ├── hooks/ → Hooks personalizados
│ ├── scripts/ → Scripts auxiliares
│ └── src/ → Serviços, utils e lógica core

├── Back-End/ → Solução .NET
│ ├── DSIN.Api/ → API principal
│ ├── DSIN.Business/ → Interfaces, DTOs, regras
│ ├── DSIN.Data/ → Acesso a dados, context, repos
│ ├── DSIN/obj/ → Arquivos compilados
│ └── Migrations/ → Migrações do banco (EF Core)

└── README.md → Documentação principal
```

---

## 🛠️ Tecnologias / Dependências (Front-End)

Para rodar a parte mobile/ front-end do projeto, são necessárias as seguintes dependências e versões:

```bash
npm install @expo/vector-icons@^15.0.3
npm install expo@54.0.23
npm install expo-constants@~18.0.10
npm install expo-font@~14.0.9
npm install expo-image@~3.0.10
npm install expo-router@~6.0.14
npm install expo-system-ui@~6.0.8
npm install expo-web-browser@~15.0.9
npm install react-native@0.81.5

npx expo install @react-native-community/datetimepicker
npx expo install react-native-gesture-handler
npx expo install react-native-reanimated
npx expo install expo-camera
npx expo install expo-file-system
npx expo install expo-image-manipulator
npx expo install expo-secure-store
npx expo install react-native-safe-area-context
npx expo install expo-status-bar
```

Requisitos para uso:
Digitar os comandos acima;
Chave API OpenAI;
Banco de Dados Postgresql;
