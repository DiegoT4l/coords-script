import '@citizenfx/client';


/**
 * Registers a command handler for 'shwcoord' and 'hcoord'.
 * 
 * This function registers two commands:
 * 1. 'shwcoord': Shows the interface.
 * 2. 'hcoord': Hides the interface.
 */
const showNUI = () => {
  SendNUIMessage({ action: 'showUI' });
  SetNuiFocus(true, true);
};

const hideNUI = () => {
  SendNUIMessage({ action: 'hideUI' });
  SetNuiFocus(false, false);
};

RegisterKeyMapping('shwcoord', 'Shows the interface', 'keyboard', 'F9');

RegisterCommand('shwcoord', showNUI, false);
RegisterCommand('hcoord', hideNUI, false);


/**
 * Registers NUI (NUI: Native User Interface) callbacks for handling specific events.
 * 
 * This function sets up two NUI callbacks:
 * 1. 'getCoordsButtonPressed': Triggered when the button to get player coordinates is pressed.
 *    - Triggers a server event 'getPlayerCoords'.
 *    - Responds with 'ok'.
 * 2. 'closeCoordsMenu': Triggered when the buttons to close the coordinates menu is pressed.
 *    - Executes the command 'hcoord'.
 *    - Responds with 'ok'.
 */

RegisterNuiCallback('getCoordsButtonPressed', (_data: any, cb: (result: string) => void) => {
  TriggerServerEvent('getPlayerCoords');
  cb('ok');
});

RegisterNuiCallback('closeCoordsMenu', (_data: any, cb: (result: string) => void) => {
  ExecuteCommand('hcoord');
  cb('ok');
});

/**
 * Registers a server event handler for 'sendCoordsToUI'.
 * 
 * This function sends the player's coordinates to the NUI interface.
 */
const hideUIOnResourceEvent = (resource: string) => {
  const currentResourceName = GetCurrentResourceName();
  if (resource === currentResourceName) hideNUI();
};

AddEventHandler('onResourceStart', hideUIOnResourceEvent);
AddEventHandler('onResourceStop', hideUIOnResourceEvent);

/**
 * Registers a server event handler for 'sendCoordsToUI'.
 * 
 * This function sends the player's coordinates to the NUI interface.
 */
onNet('sendCoordsToUI', (playerX: number, playerY: number, playerZ: number) => {
  SendNUIMessage({
    action: 'showCoords',
    coords: {
      lat: playerX,
      lon: playerY,
      alt: playerZ,
    },
  });
});
