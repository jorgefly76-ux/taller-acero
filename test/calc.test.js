const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../src/app.html','utf8');
const code=src.split('/*CALC-START*/')[1].split('/*CALC-END*/')[0];
const m=new Function(code+';return {RHO,crossArea,massPerM,beamCheck,ipeSec,IPE,weld,minLeg,bend,vDie,offsetCalc,pcd,tri,segArea,tank,packCuts,convert,FEXX};')();
let fails=0;
const near=(name,got,exp,tol)=>{const ok=Math.abs(got-exp)<=tol;if(!ok)fails++;console.log((ok?'OK  ':'FAIL'),name,got,'esperado',exp);};
// Peso: chapa 1000x2000x10 acero = 157 kg
near('chapa 1x2 m e10',m.massPerM('flat',{w:1000,t:10},7850)*2,157,0.01);
// Redondo d=50: 15.41 kg/m
near('redondo 50',m.massPerM('round',{d:50},7850),15.413,0.01);
// Cuadrado 30: 7.065
near('cuadrado 30',m.massPerM('square',{s:30},7850),7.065,0.001);
// Hexagonal 30 entre caras: 0.866*900*7850e-6=6.118
near('hex 30',m.massPerM('hex',{s:30},7850),6.119,0.01);
// Caño 60.3x3.6 aprox 5.03 kg/m (tabla 5.03)
near('caño 60.3x3.6',m.massPerM('tube',{d:60.3,t:3.6},7850),5.03,0.05);
// Perfil L 50x50x5 ≈ 3.77 kg/m (tabla 3.77)
near('L50x50x5',m.massPerM('angle',{w:50,h:50,t:5},7850),3.77,0.05);
// Viga IPE200, L=4, w=10, sin peso propio
const c=m.beamCheck(m.ipeSec(m.IPE[6]),4,10,0,235,300,false);
near('M',c.M,20,1e-9);near('V',c.V,20,1e-9);near('sigma',c.sigma,103.09,0.05);near('flecha',c.d,8.17,0.05);
// Viga con P: simple apoyada L=6, P=30 kN -> M=45
near('M puntual',m.beamCheck(m.ipeSec(m.IPE[10]),6,0,30,235,300,false).M,45,1e-9);
// Soldadura E70 pata 1/16" ≈ 1.39 kip/in = 243.4 N/mm
near('filete 1/16in',m.weld(1.5875,100,483,.6,0).phi,243.7,1.5);
near('min leg 10mm',m.minLeg(10),5,0);
// Plegado: t=2,r=2,K=.4,90°, A=B=50 -> BA=4.398 BD=3.602 flat=96.398
const b=m.bend(2,400,90,1000,16,2,0.4,50,50);
near('BA',b.BA,4.398,0.001);near('BD',b.BD,3.602,0.001);near('flat',b.flat,96.398,0.001);
near('V 3mm',m.vDie(3),24,0);near('radio auto V16',m.bend(2,400,90,1000,16,0,.4,50,50).r,2.56,1e-9);
// Offset 45° 300 mm
const o=m.offsetCalc(300,0,45,0);near('diag',o.travel,424.264,0.001);near('avance',o.run,300,1e-9);
near('rolado 300/400 → 500',m.offsetCalc(300,400,90,0).off,500,1e-9);
// PCD 6 agujeros PCD100: cuerda = 50
near('cuerda 6/100',100*Math.sin(Math.PI/6),50,1e-9);
const p=m.pcd(4,100,0);near('pcd x2',p[1].x,0,1e-9);near('pcd y2',p[1].y,50,1e-9);
// Triángulo 3-4-5
const t=m.tri(3,4,NaN,NaN);near('hip',t.c,5,1e-9);near('A',t.A,36.8699,0.001);
const t2=m.tri(NaN,NaN,10,30);near('a 30°',t2.a,5,1e-9);
// Tanque
near('segmento mitad',m.segArea(500,500),Math.PI*500*500/2,1e-6);
const k=m.tank('h',{d:1000,h:2000,level:500});near('horiz mitad L',k.fill,k.total/2,1e-6);near('horiz total L',k.total,1570.796,0.01);
near('vertical',m.tank('v',{d:1000,h:1500,level:750}).fill,589.05,0.01);
near('rect',m.tank('r',{w:1000,l:1000,h:1000,level:500}).fill,500,1e-9);
// Corte: 6000, kerf 3, piezas
const bars=m.packCuts(6000,3,[2100,2100,1200,1200,1200,1200,850,850,850,850,850,850,430,430,430,430,430,430,430,430]);
console.log('barras',bars.length,bars.map(b=>b.used));
near('uso máx <= 6000',Math.max(...bars.map(b=>b.used))<=6000?1:0,1,0);
// Conversor
near('1 in → mm',m.convert('Longitud',1,'pulg (in)').mm,25.4,1e-9);
near('1000 psi → MPa',m.convert('Presión / tensión',1000,'psi').MPa,6.8948,0.001);
near('1 kgf·m → N·m',m.convert('Par (torque)',1,'kgf·m')['N·m'],9.80665,1e-9);
console.log(fails?('FALLAS: '+fails):'TODO OK');
process.exit(fails?1:0);
