export interface SlackCheckboxOption {
  text: {
    type: string;
    text: string;
  };
  value: boolean;
}

export interface SlackSubmitAppreciationStatePayload {
  usersSelectInput: {
    usersToAppreciate: {
      type: string;
      selected_users: string[];
    };
  };
  messageInput: {
    appreciationMessage: {
      type: string;
      value: string;
    };
  };
  giftCoinInput: {
    giftCoin: {
      type: string;
      selected_options?: SlackCheckboxOption[];
    };
  };
}
