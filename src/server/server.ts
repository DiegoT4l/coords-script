import '@citizenfx/server';


const currentResourceName = GetCurrentResourceName();

AddEventHandler('onResourceStart', (resource: string) => {
    if (resource === currentResourceName) {
        console.log(`The script ${currentResourceName} started successfully!`);
    }
});

onNet("getPlayerCoords", () => {
    const player = global.source;
    const ped = GetPlayerPed(player);
    const [playerX, playerY, playerZ] = GetEntityCoords(ped);

    TriggerClientEvent("sendCoordsToUI", player, playerX, playerY, playerZ);
});
