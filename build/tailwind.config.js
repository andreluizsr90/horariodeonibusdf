/** Config do Tailwind — usada só para GERAR o CSS (build de dev).
 *  O site em produção consome apenas public/assets/css/app.css. */
module.exports = {
  content: [
    './templates/**/*.tpl',
    './public/assets/js/*.js', // classes usadas em markup gerado por JS
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef6ff',100:'#d9ebff',200:'#bcdcff',300:'#8ec6ff',400:'#59a6ff',500:'#3384fc',600:'#1d63f1',700:'#164ede',800:'#1840b4',900:'#1a3a8e',950:'#142456' },
        accent: { 400:'#ffc848',500:'#ffb020',600:'#e69100' },
      },
    },
  },
};
