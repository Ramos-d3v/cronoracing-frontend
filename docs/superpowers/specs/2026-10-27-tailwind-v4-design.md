# Configuração do Tailwind CSS v4

## Objetivo

Adicionar Tailwind CSS v4 ao projeto React existente, que usa Vite, sem substituir
ou alterar os estilos CSS atuais da aplicação.

## Abordagem

Usar a integração oficial do Tailwind v4 para Vite:

- adicionar `tailwindcss` e `@tailwindcss/vite` como dependências de desenvolvimento;
- registrar o plugin do Tailwind no `vite.config`;
- importar Tailwind em `src/index.css` com `@import "tailwindcss";`;
- manter as regras existentes de `src/index.css` e `src/App.css`;
- aplicar uma classe utilitária não visualmente disruptiva no app para verificar que
  as classes Tailwind são processadas.

Essa abordagem evita a configuração PostCSS adicional exigida por uma integração
tradicional e segue o fluxo recomendado para Tailwind v4 com Vite.

## Validação

Executar:

- `npm run build`, para confirmar que o Vite processa o CSS e gera o bundle;
- `npm run lint`, para confirmar que a configuração não introduz problemas no
  código React.

## Compatibilidade e escopo

Não haverá migração dos estilos atuais para Tailwind nesta etapa. O comportamento,
layout e aparência existentes devem permanecer preservados. A configuração deve
ser compatível com React 19 e Vite 8 já presentes no projeto.
