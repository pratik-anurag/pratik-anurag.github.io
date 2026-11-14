// Deliberately synthetic examples, assembled to avoid resembling live credentials in source.
export const samples = {
  mixed: {name:'Config with credentials', text: '# Synthetic demo values — not live credentials\n' +
    'GITHUB_TOKEN=' + 'ghp_' + 'DEMO'.repeat(9) + '\n' +
    'AWS_ACCESS_KEY_ID=' + 'AKIA' + 'DEADBEEFDEADBEEF' + '\n' +
    'aws_secret_access_key=' + 'a'.repeat(40) + '\nAPP_ENV=development\nPORT=3000'},
  slack: {name:'A pasted Slack token', text: 'Can you check this bot config?\nSLACK_TOKEN=' + 'xoxb-' + '0'.repeat(10) + '-' + '0'.repeat(13) + '-' + 'x'.repeat(24)},
  clean: {name:'No matching patterns', text:'APP_ENV=development\nPORT=3000\nLOG_LEVEL=info\nAPI_URL=https://example.invalid/api\n# Store credentials in your secret manager.'}
};
