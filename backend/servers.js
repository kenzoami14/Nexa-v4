export const servers = [{
  id: 'pokenexa', name: "Poké'Nexa", game: 'Minecraft Java', version: '1.21.1',
  loader: 'Fabric', loaderName: 'fabric', loaderVersion: '0.19.5',
  pack: "Poké'Nexa", packVersion: null, address: '90.12.207.74',
  downloadUrl: '/downloads/pokenexa-modpack.zip', status: 'unknown',
  players: null, maxPlayers: null, latency: null, category: 'Aventure'
}];
export const publicServers = () => servers.map(server => ({...server}));
