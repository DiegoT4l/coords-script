import { promises as fs } from 'fs';
import * as path from 'path';

const outdir = './coords-script';

// Función para limpiar el directorio de salida
async function cleanOutputDirectory() {
  try {
    // Elimina el directorio si existe
    await fs.rm(outdir, { recursive: true, force: true });
    console.log("Output directory cleaned.");
  } catch (error) {
    console.error("Failed to clean output directory:", error);
    process.exit(1);
  }
}

// Limpia el directorio de salida antes de compilar
await cleanOutputDirectory();

// Realiza la construcción de Bun.js
const result = await Bun.build({
  entrypoints: [
    './src/client/client.ts',
    './src/server/server.ts'
  ],
  outdir,
  target: 'node',
  format: 'esm',
  minify: true,
  naming: '[dir]/[hash].[name].[ext]',
  root: './src',
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

// Obtén los nombres generados para cliente y servidor
const clientFileName = result.outputs.find((output) => output.path.includes('client'))?.path.split('/').pop();
const serverFileName = result.outputs.find((output) => output.path.includes('server'))?.path.split('/').pop();

if (clientFileName && serverFileName) {
  await updateFxManifest(clientFileName, serverFileName);
} else {
  console.error("Failed to locate client or server script in outputs");
}

// Función para actualizar el `fxmanifest.lua` con los nuevos nombres de archivo
async function updateFxManifest(clientFileName: string, serverFileName: string) {
  const fxManifestPath = path.join(outdir, 'fxmanifest.lua');
  let fxManifestContent = await fs.readFile('./src/fxmanifest.lua', 'utf-8');

  // Reemplaza los nombres en el `fxmanifest.lua`
  fxManifestContent = fxManifestContent.replace('client/client.js', `client/${clientFileName}`);
  fxManifestContent = fxManifestContent.replace('server/server.js', `server/${serverFileName}`);

  // Guarda el archivo actualizado en el directorio de salida
  await fs.writeFile(fxManifestPath, fxManifestContent);
}

// Copia la carpeta `web/` al directorio de salida
async function copyWebFolder() {
  const srcWebPath = path.join('./src', 'web');
  const destWebPath = path.join(outdir, 'web');

  await fs.mkdir(destWebPath, { recursive: true });
  const files = await fs.readdir(srcWebPath);

  for (const file of files) {
    const srcFilePath = path.join(srcWebPath, file);
    const destFilePath = path.join(destWebPath, file);
    await fs.copyFile(srcFilePath, destFilePath);
  }
}

await copyWebFolder();
console.log("Build complete and files copied successfully.");
