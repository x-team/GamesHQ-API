export async function awardPrize() {
// grantedBy: User,
// grantedTo: User,
// lunaAmountNumber: number,
// coinAmountNumber: number,
// transaction: Transaction
  return Promise.resolve(true);
  // const reason = 'The Tower winner';
  // const operation = VAULT_CURRENCY_OPERATION.INCREMENT;
  // const slackGrantedTosUsername = `<@${grantedTo.slackId}>`;
  // const slackGrantedByUsername = `<@${grantedBy.slackId}>`;
  // const vaultLunaModifier: VaultCurrencyStashModifier = {
  //   operation,
  //   value: lunaAmountNumber,
  //   reason,
  //   vaultCurrencyId: VAULT_CURRENCY.LUNA,
  // };
  // const vaultCoinModifier: VaultCurrencyStashModifier = {
  //   operation,
  //   value: coinAmountNumber,
  //   reason,
  //   vaultCurrencyId: VAULT_CURRENCY.COIN,
  // };
  // if (lunaAmountNumber !== ZERO) {
  //   const lunaTransaction = await createTransaction({
  //     grantedTo,
  //     grantedBy,
  //     modifier: vaultLunaModifier,
  //     t: transaction,
  //   });
  //   const lunaVaultCurrencyStash = lunaTransaction.stash[vaultLunaModifier.vaultCurrencyId];
  //   await notifyActivityLogChannel(
  //     slackGrantedTosUsername,
  //     operation,
  //     vaultLunaModifier.value,
  //     slackGrantedByUsername,
  //     vaultLunaModifier.reason,
  //     lunaVaultCurrencyStash,
  //     vaultLunaModifier.vaultCurrencyId
  //   );
  // }

  // if (coinAmountNumber !== ZERO) {
  //   const coinTransaction = await createTransaction({
  //     grantedTo,
  //     grantedBy,
  //     modifier: vaultCoinModifier,
  //     t: transaction,
  //   });
  //   const coindVaultCurrencyStash = coinTransaction.stash[vaultCoinModifier.vaultCurrencyId];
  //   await notifyActivityLogChannel(
  //     slackGrantedTosUsername,
  //     operation,
  //     vaultCoinModifier.value,
  //     slackGrantedByUsername,
  //     vaultCoinModifier.reason,
  //     coindVaultCurrencyStash,
  //     vaultCoinModifier.vaultCurrencyId
  //   );
  // }
}
