const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html','utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert(script, 'DOMO não contém script');
const source = script.split('const $ =')[0];
assert(source.includes('function analyzeText'), 'Análise de texto não encontrada');
const analyzeText = vm.runInNewContext(source + '\n;analyzeText', {URL,TextDecoder,Uint8Array});
let checks=0;
function check(input, level, required){
  const result=analyzeText(input);
  assert.equal(result.level,level, input.slice(0,75));
  if(required) assert(result.evidence.some(e=>e.code===required),
     'Sinal não encontrado: '+required+' em '+input);
  assert(!/confirmad[ao]|desmentid[ao]/i.test(result.title),
     'Não há base para declarar confirmação');
  checks++;
}
check('No Paquistão, boatos durante a campanha de vacinação contra o HPV diziam que os imunizantes causavam infertilidade e deficiências.', 'yellow', 'health-claim');
check('Uma dieta saudável pode curar o câncer de mama.', 'yellow','health-claim');
check('Comer certos alimentos durante a gravidez deixa a pele do bebê mais clara.', 'yellow','health-claim');
check('O artigo descreve boatos sobre vacinas contra HPV e infertilidade, sem defendê-los.', 'yellow', 'claims-context');
check('A Terra é plana.', 'yellow','not-fact-checked');
check('Oi, bom dia! Tudo bem?', 'green');
check('URGENTE! Compartilhe com todos e faça um pix hoje.', 'yellow','urgency');
check('Leia https://bit.ly/teste antes de enviar seus dados bancários.', 'yellow','short-url');
check('A pesquisa foi divulgada há pouco tempo pela comunidade médica especializada.', 'yellow','not-fact-checked');
console.log('DOMO Web: '+checks+' testes de texto aprovados.');
