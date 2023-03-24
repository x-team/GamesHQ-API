// slackId text is escaped like <@slackUserId> https://api.slack.com/slash-commands
export function parseEscapedSlackUserValues(slackUser: string, escapedValues: string[] = []) {
  if (slackUser.indexOf('<') === 0) {
    const NO_SPECIAL_CHARACTERS = 1;
    const user = slackUser.substr(1).slice(0, -1);

    const [id, username] = user.split('|');

    const result: string[] = [];

    if (escapedValues.includes('id')) {
      result.push(id.substr(NO_SPECIAL_CHARACTERS));
    }
    if (escapedValues.includes('username')) {
      result.push(username);
    }
    return result.length ? result : id.substr(NO_SPECIAL_CHARACTERS);
  } else {
    return slackUser.replace('@', '');
  }
}

// slackId text is escaped like <@slackUserId> https://api.slack.com/slash-commands
export function parseEscapedSlackId(slackUser: string) {
  if (slackUser.indexOf('<') === 0) {
    const NO_SPECIAL_CHARACTERS = 1;
    const user = slackUser.substr(1).slice(0, -1);

    const [id] = user.split('|');

    return id.substr(NO_SPECIAL_CHARACTERS);
  } else {
    return slackUser.replace('@', '');
  }
}

// We need to acknowledge the request to Slack within 3 seconds
export function acknowledgeSlackResponse() {
  process.nextTick(() => {
    return {};
  });
}
