# 📊 Manager Pro - Sistema de Gestão de Pastagem

**Versão:** 2.4.1  
**Desenvolvido para:** Pasto Verde Consultoria  
**Autor:** Claude + Lucas Teixeira  
**Repositório:** SistemaPastoVerde

---

## 🎯 O QUE É ESTE REPOSITÓRIO?

Este é o **repositório CORE** do Manager Pro - contém todo o código JavaScript do sistema.

O site principal (`pastoverdeconsultoria.github.io/webapp24`) **referencia este código via CDN**, então qualquer atualização aqui se reflete automaticamente no site!

---

## 📦 ESTRUTURA:

```
SistemaPastoVerde/
├── app.js          ← Código completo do sistema
├── README.md       ← Este arquivo
└── versions/       ← (futuro) Versões antigas
```

---

## 🚀 COMO FUNCIONA:

### **1. Site Principal (webapp24):**
```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/gh/pastoverdeconsultoria/SistemaPastoVerde@main/app.js"></script>
```

### **2. CDN (jsDelivr):**
- Monitora este repositório
- Quando você faz **push**, atualiza o cache
- Entrega o arquivo para o site em segundos

### **3. Resultado:**
✅ Site sempre atualizado  
✅ Sem precisar editar o index.html  
✅ Versionamento automático

---

## 🔄 COMO ATUALIZAR O SISTEMA:

### **Opção A: Via GitHub Web**

1. Acesse: `https://github.com/pastoverdeconsultoria/SistemaPastoVerde`
2. Clique em `app.js`
3. Clique no lápis ✏️ (Edit)
4. Faça as alterações
5. **Commit changes**
6. ✅ Pronto! Site atualiza em 1-2 minutos

### **Opção B: Via Git (linha de comando)**

```bash
# Clone o repositório
git clone https://github.com/pastoverdeconsultoria/SistemaPastoVerde.git
cd SistemaPastoVerde

# Faça alterações no app.js
nano app.js

# Commit e push
git add app.js
git commit -m "Melhoria: descrição da mudança"
git push

# ✅ Pronto! CDN atualiza automaticamente
```

---

## 📌 VERSÕES:

### **Usar sempre a última:**
```html
<script src="...@main/app.js"></script>
```
✅ Recomendado para produção  
⚠️ Atualiza automaticamente

### **Fixar em uma versão específica:**
```html
<script src="...@v2.4/app.js"></script>
```
✅ Não atualiza (estável)  
⚠️ Precisa trocar manualmente

---

## 🛠️ TECNOLOGIAS:

- **React 18** - Interface
- **Tailwind CSS** - Estilos
- **Geolocation API** - GPS
- **LocalStorage** - Persistência
- **KML Parser** - Importação de mapas

---

## 📝 CHANGELOG:

### v2.4.1 (atual)
- ✅ GPS com detecção de piquete
- ✅ Sistema de backup/restaurar
- ✅ Importação KML com detecção de reservas
- ✅ Gestão de lotes, módulos e áreas
- ✅ Cálculo automático de UA
- ✅ Interface responsiva

### v2.4.0
- Versão inicial estável

---

## 🔐 SEGURANÇA:

- ✅ Repositório público (código aberto)
- ✅ Apenas você pode fazer push (owner)
- ✅ CDN com SSL/HTTPS
- ✅ Sem coleta de dados pessoais

---

## 📞 SUPORTE:

Dúvidas ou problemas? Entre em contato com o desenvolvedor.

---

## 📄 LICENÇA:

Copyright © 2025 Pasto Verde Consultoria  
Todos os direitos reservados.
