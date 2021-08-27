// import { User } from "../../../../../../models";
// import { findTowerFloorById } from "../../../../../../models/TowerFloor";
// import { createBattlefield, totalEnemiesAlive, totalRaidersAlive } from "../../../../../../models/TowerFloorBattlefield";
// import { addTowerFloorBattlefieldEnemies, findEnemiesByFloorBattlefield } from "../../../../../../models/TowerFloorBattlefieldEnemy";
// import { addRaidersToTowerFloorBattlefield } from "../../../../../../models/TowerRaider";
// import { startRound } from "../../../../../../models/TowerRound";
// import { findAllActionsByRound } from "../../../../../../models/TowerRoundAction";
// import { updateTowerAsCompleted } from "../../../../../../models/TowerStatistics";
// import { ONE, TWO, ZERO } from "../../../../../consts/global";
// import { SlackBlockKitLayoutElement } from "../../../../../model/SlackBlockKit";
// import { GameResponse, getGameResponse } from "../../../../../utils";
// import { HEALTHKIT_HEALING, MAX_RAIDER_HEALTH } from "../../../../consts";
// import { generateTowerActionsBlockKit } from "../../../../generators/gameplay";
// import { publishTowerPublicMessage, raiderActionsAlive, theTowerNotifyEphemeral, theTowerNotifyInPrivate, TowerRaiderInteraction, withTowerTransaction } from "../../../../utils";
// import { leaveTower } from "../../../../utils/leave-tower";
// import { TowerEngine } from "../../engine";
// import { towerCommandReply } from "../../replies";

// const towerGameEngine = TowerEngine.getInstance();

// export async function startRoundCommand(userRequesting: User) {
//   return withTowerTransaction(async (transaction) => {
//     const raiderActions = await raiderActionsAlive(userRequesting, transaction);
//     if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
//       return raiderActions as GameResponse;
//     }
//     const { raider, round } = raiderActions as TowerRaiderInteraction;
//     const towerFloor = (await findTowerFloorById(
//       round._floorBattlefield?._towerFloorId!,
//       true,
//       transaction
//     ))!;
//     const enemies = await findEnemiesByFloorBattlefield(
//       round._towerFloorBattlefieldId,
//       transaction
//     );
//     await towerGameEngine.generateEnemiesActions(
//       round,
//       enemies.filter((enemy) => enemy.health > ZERO),
//       transaction
//     );
//     // Needed because round.reload() won't work
//     const roundActions = await findAllActionsByRound(round.id, transaction);
//     await towerGameEngine.runRound(round, roundActions, transaction);
//     const totalEnemies = await totalEnemiesAlive(round._towerFloorBattlefieldId, transaction);
//     const totalRaiders = await totalRaidersAlive(round._towerFloorBattlefieldId, transaction);
//     if (totalRaiders === ZERO) {
//       await leaveTower({ raider, round }, transaction);
//       await theTowerNotifyInPrivate(
//         towerCommandReply.raiderLoseTower(raider._user?.slackId!, towerFloor.number),
//         raider._user?.slackId!
//       );
//       await publishTowerPublicMessage(
//         towerCommandReply.raiderLoseTower(raider._user?.slackId!, towerFloor.number)
//       );
//       const blockKit = generateReEnterTowerQuestionSection(
//         towerCommandReply.raiderMustEnter()
//       );
//       await theTowerNotifyEphemeral('', raider._user?.slackId!, raider._user?.slackId!, blockKit);
//       return getGameResponse(towerCommandReply.commandFinished('Start Round'));
//     }
//     if (totalEnemies > 0) {
//       // Update raider to display progress
//       await raider.reloadFullInventory(transaction);
//       const hud = towerCommandReply.raiderHUD(raider);
//       // Check new enemies health
//       await Promise.all(
//         enemies.map((enemy) => enemy.reloadFullEnemy(transaction))
//       );
//       await theTowerNotifyInPrivate(
//         towerCommandReply.raiderBasicCharactersProgress(raider, enemies),
//         raider._user?.slackId!
//       );
//       await startRound(
//         round._towerFloorBattlefieldId,
//         userRequesting.id,
//         towerFloor.isEveryoneVisible,
//         transaction
//       );
//       const actionBlockkit = generateTowerActionsBlockKit(hud);
//       await theTowerNotifyEphemeral(
//         '',
//         raider._user?.slackId!,
//         raider._user?.slackId!,
//         actionBlockkit
//       );
//     } else {
//       await round.endRound(transaction);

//       if (towerFloor.number === towerFloor._towerGame?.height) {
//         await theTowerNotifyInPrivate(
//           `${towerCommandReply.raiderWinsTower(raider._user?.slackId!)}\n\n` +
//             `${towerCommandReply.finalStats(raider)}`,
//           raider._user?.slackId!
//         );
//         await updateTowerAsCompleted(towerFloor._towerGameId, raider._user?.id, transaction);
//         // TOWER PRIZE
//         await this.awardPrize(
//           raider._user!,
//           raider._user!,
//           towerFloor._towerGame!.lunaPrize,
//           towerFloor._towerGame!.coinPrize,
//           transaction
//         );
//         await publishTowerPublicMessage(
//           towerCommandReply.channelRaiderWonTheTower(raider._user?.slackId!)
//         );
//       } else {
//         const nextFloorNumber = towerFloor.number + ONE;
//         await raider.reloadFullInventory(transaction);
//         await theTowerNotifyInPrivate(
//           towerCommandReply.channelEndingTheFloor(nextFloorNumber),
//           raider._user?.slackId!
//         );
//         const previousHealth = raider.health;
//         const lootPrize = await towerGameEngine.generateLoot(
//           towerFloor,
//           raider,
//           transaction
//         );
//         await raider.reloadFullInventory(transaction);
//         const healthKitsLooted = lootPrize.filter(
//           (prize) => prize.name === TOWER_HEALTHKITS.COMMON
//         ).length;
//         const healthKitsNeededToFullHP = Math.ceil(
//           (MAX_RAIDER_HEALTH - previousHealth) / HEALTHKIT_HEALING
//         );
//         const healthKitsAutoApplied = Math.min(healthKitsNeededToFullHP, healthKitsLooted);
//         await theTowerNotifyInPrivate(
//           towerCommandReply.channelLootPrizeEarned(lootPrize, healthKitsAutoApplied),
//           raider._user?.slackId!
//         );

//         const nextFloor = towerFloor._towerGame?._floors!.find(
//           (floor) => floor.number === nextFloorNumber
//         )!;
//         const newBattlefield = await createBattlefield(nextFloor.id, transaction);
//         await addRaidersToTowerFloorBattlefield(newBattlefield.id, [raider], transaction);
//         await addTowerFloorBattlefieldEnemies(
//           newBattlefield.id,
//           nextFloor._floorEnemies!,
//           transaction
//         );
//         // Create round
//         await startRound(
//           newBattlefield.id,
//           raider._user?.id ?? ZERO,
//           nextFloor.isEveryoneVisible,
//           transaction
//         );
//         const nextFloorEnemies =
//           nextFloor._floorEnemies?.map((floorEnemy) => floorEnemy._enemy!) || [];
//         await theTowerNotifyInPrivate(
//           `${towerCommandReply.welcomeToNewFloor(nextFloor.number)}\n` +
//             `${towerCommandReply.enemiesGifs(nextFloorEnemies)}`,
//           raider._user?.slackId!
//         );
//         let mutableBlockKitElements: SlackBlockKitLayoutElement[];
//         if (nextFloor.number % TWO !== ZERO) {
//           const { perksToPick, item, itemType } = await towerGameEngine.generatePerksAndItem(
//             raider,
//             nextFloor,
//             transaction
//           );
//           mutableBlockKitElements = generateTowerPerkPickerSection(perksToPick, item, itemType);
//           await theTowerNotifyEphemeral(
//             '',
//             raider._user?.slackId!,
//             raider._user?.slackId!,
//             mutableBlockKitElements
//           );
//         } else {
//           const hud = towerCommandReply.raiderHUD(raider);
//           mutableBlockKitElements = generateTowerActionsBlockKit(hud);
//           await theTowerNotifyEphemeral(
//             '',
//             raider._user?.slackId!,
//             raider._user?.slackId!,
//             mutableBlockKitElements
//           );
//         }
//       }
//     }
//     return getGameResponse(towerCommandReply.commandFinished('Start Round'));
//   });
// }
