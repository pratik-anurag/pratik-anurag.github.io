// Generated from Nosey Parker (Apache-2.0). Modified: regex syntax translated for ECMAScript.
export const corpus = {
  "revision": "2e6e7f36ce36619852532bbe698d8cb7a26d2da7",
  "files": [
    "aws",
    "github",
    "gitlab",
    "slack",
    "stripe",
    "npm",
    "openai",
    "pem",
    "google"
  ],
  "rules": [
    {
      "id": "np.aws.1",
      "name": "AWS API Key",
      "file": "aws.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "\\b((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})\\b",
      "source": "\\b((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 5,
        "passed": true
      }
    },
    {
      "id": "np.aws.2",
      "name": "AWS Secret Access Key",
      "file": "aws.yml",
      "categories": [
        "api",
        "fuzzy",
        "secret"
      ],
      "pattern": "(?x)(?i)\n\\b\naws_? (?:secret)? _? (?:access)? _? (?:key)?\n[\"'']?\n\\s{0,30}\n(?::|=>|=)\n\\s{0,30}\n[\"'']?\n([a-z0-9/+=]{40})\n(?: [^a-z0-9/+=] | $ )\n",
      "source": "\\baws_?(?:secret)?_?(?:access)?_?(?:key)?[\"'']?\\s{0,30}(?::|=>|=)\\s{0,30}[\"'']?([a-z0-9/+=]{40})(?:[^a-z0-9/+=]|$)",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 3,
        "negative": 8,
        "passed": true
      }
    },
    {
      "id": "np.aws.3",
      "name": "AWS Account ID",
      "file": "aws.yml",
      "categories": [
        "api",
        "fuzzy",
        "identifier"
      ],
      "pattern": "(?i)aws_?(?:account)_?(?:id)?[\"'`]?\\s{0,30}(?::|=>|=)\\s{0,30}[\"'`]?([0-9]{4}-?[0-9]{4}-?[0-9]{4})",
      "source": "aws_?(?:account)_?(?:id)?[\"'`]?\\s{0,30}(?::|=>|=)\\s{0,30}[\"'`]?([0-9]{4}-?[0-9]{4}-?[0-9]{4})",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 2,
        "negative": 3,
        "passed": true
      }
    },
    {
      "id": "np.aws.4",
      "name": "AWS Session Token",
      "file": "aws.yml",
      "categories": [
        "api",
        "fuzzy",
        "secret"
      ],
      "pattern": "(?i)(?:aws.?session|aws.?session.?token|aws.?token)[\"'`]?\\s{0,30}(?::|=>|=)\\s{0,30}[\"'`]?([a-z0-9/+=]{16,200})[^a-z0-9/+=]",
      "source": "(?:aws.?session|aws.?session.?token|aws.?token)[\"'`]?\\s{0,30}(?::|=>|=)\\s{0,30}[\"'`]?([a-z0-9/+=]{16,200})[^a-z0-9/+=]",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 1,
        "negative": 3,
        "passed": true
      }
    },
    {
      "id": "np.aws.5",
      "name": "Amazon MWS Auth Token",
      "file": "aws.yml",
      "categories": [
        "api"
      ],
      "pattern": "(?i)(amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
      "source": "(amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.s3.1",
      "name": "AWS S3 Bucket",
      "file": "aws.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?x)\n(?: ^ | [\\s/\"'] | %2F )\n(\n(?: [a-zA-Z0-9_-]+ \\. )+   (?# bucket name as subdomain )\n(?: s3\n  | s3-af-south-1\n  | s3-ap-east-1\n  | s3-ap-northeast-1\n  | s3-ap-northeast-2\n  | s3-ap-northeast-3\n  | s3-ap-south-1\n  | s3-ap-south-2\n  | s3-ap-southeast-1\n  | s3-ap-southeast-2\n  | s3-ap-southeast-3\n  | s3-ap-southeast-4\n  | s3-ca-central-1\n  | s3-eu-central-1\n  | s3-eu-central-2\n  | s3-eu-north-1\n  | s3-eu-south-1\n  | s3-eu-south-2\n  | s3-eu-west-1\n  | s3-eu-west-2\n  | s3-eu-west-3\n  | s3-me-central-1\n  | s3-me-south-1\n  | s3-sa-east-1\n  | s3-us-east-1\n  | s3-us-east-2\n  | s3-us-gov-east-1\n  | s3-us-gov-west-1\n  | s3-us-west-1\n  | s3-us-west-2\n  )\n\\.amazonaws\\.com\n) \\b\n",
      "source": "(?:^|[\\s/\"']|%2F)((?:[a-zA-Z0-9_-]+\\.)+(?:s3|s3-af-south-1|s3-ap-east-1|s3-ap-northeast-1|s3-ap-northeast-2|s3-ap-northeast-3|s3-ap-south-1|s3-ap-south-2|s3-ap-southeast-1|s3-ap-southeast-2|s3-ap-southeast-3|s3-ap-southeast-4|s3-ca-central-1|s3-eu-central-1|s3-eu-central-2|s3-eu-north-1|s3-eu-south-1|s3-eu-south-2|s3-eu-west-1|s3-eu-west-2|s3-eu-west-3|s3-me-central-1|s3-me-south-1|s3-sa-east-1|s3-us-east-1|s3-us-east-2|s3-us-gov-east-1|s3-us-gov-west-1|s3-us-west-1|s3-us-west-2)\\.amazonaws\\.com)\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 3,
        "negative": 2,
        "passed": true
      }
    },
    {
      "id": "np.s3.2",
      "name": "AWS S3 Bucket",
      "file": "aws.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?x)\n(?: ^ | [\\s/\"'] | %2F )\n(\n(?: s3\n  | s3-af-south-1\n  | s3-ap-east-1\n  | s3-ap-northeast-1\n  | s3-ap-northeast-2\n  | s3-ap-northeast-3\n  | s3-ap-south-1\n  | s3-ap-south-2\n  | s3-ap-southeast-1\n  | s3-ap-southeast-2\n  | s3-ap-southeast-3\n  | s3-ap-southeast-4\n  | s3-ca-central-1\n  | s3-eu-central-1\n  | s3-eu-central-2\n  | s3-eu-north-1\n  | s3-eu-south-1\n  | s3-eu-south-2\n  | s3-eu-west-1\n  | s3-eu-west-2\n  | s3-eu-west-3\n  | s3-me-central-1\n  | s3-me-south-1\n  | s3-sa-east-1\n  | s3-us-east-1\n  | s3-us-east-2\n  | s3-us-gov-east-1\n  | s3-us-gov-west-1\n  | s3-us-west-1\n  | s3-us-west-2\n  )\n\\.amazonaws\\.com\n/\n[a-zA-Z0-9_][a-zA-Z0-9_-]* (?: \\. [a-zA-Z0-9_-]+)*   (?# bucket name as path )\n)\n(?: [^a-zA-Z0-9_-] | $ )                             (?# this instead of a \\b anchor because that doesn't play nicely with `-` )\n",
      "source": "(?:^|[\\s/\"']|%2F)((?:s3|s3-af-south-1|s3-ap-east-1|s3-ap-northeast-1|s3-ap-northeast-2|s3-ap-northeast-3|s3-ap-south-1|s3-ap-south-2|s3-ap-southeast-1|s3-ap-southeast-2|s3-ap-southeast-3|s3-ap-southeast-4|s3-ca-central-1|s3-eu-central-1|s3-eu-central-2|s3-eu-north-1|s3-eu-south-1|s3-eu-south-2|s3-eu-west-1|s3-eu-west-2|s3-eu-west-3|s3-me-central-1|s3-me-south-1|s3-sa-east-1|s3-us-east-1|s3-us-east-2|s3-us-gov-east-1|s3-us-gov-west-1|s3-us-west-1|s3-us-west-2)\\.amazonaws\\.com/[a-zA-Z0-9_][a-zA-Z0-9_-]*(?:\\.[a-zA-Z0-9_-]+)*)(?:[^a-zA-Z0-9_-]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 5,
        "passed": true
      }
    },
    {
      "id": "np.arn.1",
      "name": "Amazon Resource Name",
      "file": "aws.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?x)\n\\b\n(\n  arn\n  :\n  (?: aws | aws-cn | aws-us-gov )         (?# partition )\n  :\n  [a-zA-Z0-9_-]{2,}                       (?# service )\n  :\n  (?: af-south-1\n    | ap-east-1\n    | ap-northeast-1\n    | ap-northeast-2\n    | ap-northeast-3\n    | ap-south-1\n    | ap-south-2\n    | ap-southeast-1\n    | ap-southeast-2\n    | ap-southeast-3\n    | ap-southeast-4\n    | ca-central-1\n    | eu-central-1\n    | eu-central-2\n    | eu-north-1\n    | eu-south-1\n    | eu-south-2\n    | eu-west-1\n    | eu-west-2\n    | eu-west-3\n    | me-central-1\n    | me-south-1\n    | sa-east-1\n    | us-east-1\n    | us-east-2\n    | us-gov-east-1\n    | us-gov-west-1\n    | us-west-1\n    | us-west-2\n    )?                                    (?# region )\n  :\n  (?: \\d{12} )?                           (?# account ID sans hyphens )\n  :\n  (?: [a-zA-Z0-9_-]+ [:/])?               (?# resource type)\n  [^\\s\"'&<>\\\\%]+                          (?# resource ID)\n)\n(?: [\\s\"'&<>\\\\%] | $ )\n",
      "source": "\\b(arn:(?:aws|aws-cn|aws-us-gov):[a-zA-Z0-9_-]{2,}:(?:af-south-1|ap-east-1|ap-northeast-1|ap-northeast-2|ap-northeast-3|ap-south-1|ap-south-2|ap-southeast-1|ap-southeast-2|ap-southeast-3|ap-southeast-4|ca-central-1|eu-central-1|eu-central-2|eu-north-1|eu-south-1|eu-south-2|eu-west-1|eu-west-2|eu-west-3|me-central-1|me-south-1|sa-east-1|us-east-1|us-east-2|us-gov-east-1|us-gov-west-1|us-west-1|us-west-2)?:(?:\\d{12})?:(?:[a-zA-Z0-9_-]+[:/])?[^\\s\"'&<>\\\\%]+)(?:[\\s\"'&<>\\\\%]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 9,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.appsync.1",
      "name": "AWS AppSync API Key",
      "file": "aws.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(da2-[a-z0-9]{26})\n\\b\n",
      "source": "\\b(da2-[a-z0-9]{26})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.1",
      "name": "GitHub Personal Access Token",
      "file": "github.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(ghp_[a-zA-Z0-9]{36})\\b",
      "source": "\\b(ghp_[a-zA-Z0-9]{36})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 3,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.2",
      "name": "GitHub OAuth Access Token",
      "file": "github.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(gho_[a-zA-Z0-9]{36})\\b",
      "source": "\\b(gho_[a-zA-Z0-9]{36})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.3",
      "name": "GitHub App Token",
      "file": "github.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b((?:ghu|ghs)_[a-zA-Z0-9]{36})\\b",
      "source": "\\b((?:ghu|ghs)_[a-zA-Z0-9]{36})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.4",
      "name": "GitHub Refresh Token",
      "file": "github.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(ghr_[a-zA-Z0-9]{76})\\b",
      "source": "\\b(ghr_[a-zA-Z0-9]{76})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.5",
      "name": "GitHub Client ID",
      "file": "github.yml",
      "categories": [
        "api",
        "fuzzy",
        "identifier"
      ],
      "pattern": "(?x)(?i)\n(?:github)\n.?\n(?: api | app | application | client | consumer | customer )?\n.?\n(?: id | identifier | key )\n.{0,2} \\s{0,20} .{0,2} \\s{0,20} .{0,2}  (?# string terminators, whitespace, binding operators, etc )\n\\b ([a-z0-9]{20}) \\b\n",
      "source": "(?:github).?(?:api|app|application|client|consumer|customer)?.?(?:id|identifier|key).{0,2}\\s{0,20}.{0,2}\\s{0,20}.{0,2}\\b([a-z0-9]{20})\\b",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.6",
      "name": "GitHub Secret Key",
      "file": "github.yml",
      "categories": [
        "api",
        "fuzzy",
        "secret"
      ],
      "pattern": "(?x)(?i)\ngithub\n.?\n(?: api | app | application | client | consumer | customer | secret | key )\n.?\n(?: key | oauth | sec | secret )?\n.{0,2} \\s{0,20} .{0,2} \\s{0,20} .{0,2}  (?# string terminators, whitespace, binding operators, etc )\n\\b ([a-z0-9]{40}) \\b\n",
      "source": "github.?(?:api|app|application|client|consumer|customer|secret|key).?(?:key|oauth|sec|secret)?.{0,2}\\s{0,20}.{0,2}\\s{0,20}.{0,2}\\b([a-z0-9]{40})\\b",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.github.7",
      "name": "GitHub Personal Access Token (fine-grained permissions)",
      "file": "github.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(github_pat_[0-9a-zA-Z_]{82})\n\\b\n",
      "source": "\\b(github_pat_[0-9a-zA-Z_]{82})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.gitlab.1",
      "name": "GitLab Runner Registration Token",
      "file": "gitlab.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(GR1348941[0-9a-zA-Z_-]{20})(?:\\b|$)",
      "source": "\\b(GR1348941[0-9a-zA-Z_-]{20})(?:\\b|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.gitlab.2",
      "name": "GitLab Personal Access Token",
      "file": "gitlab.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(glpat-[0-9a-zA-Z_-]{20})(?:\\b|$)",
      "source": "\\b(glpat-[0-9a-zA-Z_-]{20})(?:\\b|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.gitlab.3",
      "name": "GitLab Pipeline Trigger Token",
      "file": "gitlab.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(glptt-[0-9a-f]{40})\\b",
      "source": "\\b(glptt-[0-9a-f]{40})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.slack.2",
      "name": "Slack Bot Token",
      "file": "slack.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(xoxb-[0-9]{10,12}-[0-9]{10,14}-[a-zA-Z0-9]{23,25})\\b",
      "source": "\\b(xoxb-[0-9]{10,12}-[0-9]{10,14}-[a-zA-Z0-9]{23,25})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 4,
        "negative": 3,
        "passed": true
      }
    },
    {
      "id": "np.slack.4",
      "name": "Slack User Token",
      "file": "slack.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(xoxp-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-f0-9]{32})\\b",
      "source": "\\b(xoxp-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-f0-9]{32})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 3,
        "negative": 3,
        "passed": true
      }
    },
    {
      "id": "np.slack.5",
      "name": "Slack App Token",
      "file": "slack.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(xapp-[0-9]{12}-[a-zA-Z0-9/+]{24})\\b",
      "source": "\\b(xapp-[0-9]{12}-[a-zA-Z0-9/+]{24})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.slack.6",
      "name": "Slack Legacy Bot Token",
      "file": "slack.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "\\b(xoxb-[0-9]{10,13}-[a-zA-Z0-9]{24})\\b",
      "source": "\\b(xoxb-[0-9]{10,13}-[a-zA-Z0-9]{24})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 4,
        "passed": true
      }
    },
    {
      "id": "np.slack.3",
      "name": "Slack Webhook",
      "file": "slack.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?i)(https://hooks.slack.com/services/T[a-z0-9_]{8}/B[a-z0-9_]{8,12}/[a-z0-9_]{24})",
      "source": "(https://hooks.slack.com/services/T[a-z0-9_]{8}/B[a-z0-9_]{8,12}/[a-z0-9_]{24})",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.stripe.1",
      "name": "Stripe API Key",
      "file": "stripe.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?i)\\b((?:sk|rk)_live_[a-z0-9]{24})\\b",
      "source": "\\b((?:sk|rk)_live_[a-z0-9]{24})\\b",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.stripe.2",
      "name": "Stripe API Test Key",
      "file": "stripe.yml",
      "categories": [
        "api",
        "secret",
        "test"
      ],
      "pattern": "(?i)\\b((?:sk|rk)_test_[a-z0-9]{24})\\b",
      "source": "\\b((?:sk|rk)_test_[a-z0-9]{24})\\b",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.npm.1",
      "name": "NPM Access Token (fine-grained)",
      "file": "npm.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(npm_[A-Za-z0-9]{36})\n\\b\n",
      "source": "\\b(npm_[A-Za-z0-9]{36})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 1,
        "passed": true
      }
    },
    {
      "id": "np.openai.1",
      "name": "OpenAI API Key",
      "file": "openai.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(sk-[a-zA-Z0-9]{48})\n\\b\n",
      "source": "\\b(sk-[a-zA-Z0-9]{48})\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.pem.1",
      "name": "PEM-Encoded Private Key",
      "file": "pem.yml",
      "categories": [
        "secret"
      ],
      "pattern": "(?x)\n-----BEGIN\\ .{0,20}\\ ?PRIVATE\\ KEY\\ ?.{0,20}-----\n\\s*\n( (?: [a-zA-Z0-9+/=\\s\"',] | \\\\r | \\\\n ) {50,} )\n\\s*\n-----END\\ .{0,20}\\ ?PRIVATE\\ KEY\\ ?.{0,20}-----\n",
      "source": "-----BEGIN\\ .{0,20}\\ ?PRIVATE\\ KEY\\ ?.{0,20}-----\\s*((?:[a-zA-Z0-9+/=\\s\"',]|\\\\r|\\\\n){50,})\\s*-----END\\ .{0,20}\\ ?PRIVATE\\ KEY\\ ?.{0,20}-----",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 3,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.pem.2",
      "name": "Base64-PEM-Encoded Private Key",
      "file": "pem.yml",
      "categories": [
        "secret"
      ],
      "pattern": "(?x)\n(\n  (?: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0t             (?# prefix of base64 encoding of `-----BEGIN RSA PRIVATE KEY-----` )\n    | LS0tLS1CRUdJTiBEU0EgUFJJVkFURSBLRVktLS0t             (?# prefix of base64 encoding of `-----BEGIN DSA PRIVATE KEY-----` )\n    | LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0t             (?# prefix of base64 encoding of `-----BEGIN EC PRIVATE KEY-----` )\n    )\n  [a-zA-Z0-9+/=]{50,}\n)\n(?: [^a-zA-Z0-9+/=] | $ )\n",
      "source": "((?:LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0t|LS0tLS1CRUdJTiBEU0EgUFJJVkFURSBLRVktLS0t|LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0t)[a-zA-Z0-9+/=]{50,})(?:[^a-zA-Z0-9+/=]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.google.1",
      "name": "Google Client ID",
      "file": "google.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?i)\\b([0-9]+-[a-z0-9_]{32})\\.apps\\.googleusercontent\\.com",
      "source": "\\b([0-9]+-[a-z0-9_]{32})\\.apps\\.googleusercontent\\.com",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 4,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.google.2",
      "name": "Google OAuth Client Secret",
      "file": "google.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(GOCSPX-[a-zA-Z0-9_-]{28})\n(?:[^a-zA-Z0-9_-] | $)\n",
      "source": "\\b(GOCSPX-[a-zA-Z0-9_-]{28})(?:[^a-zA-Z0-9_-]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.google.3",
      "name": "Google OAuth Client Secret",
      "file": "google.yml",
      "categories": [
        "api",
        "fuzzy",
        "secret"
      ],
      "pattern": "(?x)(?i)\nclient.?secret .{0,10}\n\\b\n([a-z0-9_-]{24})\n(?: [^a-z0-9_-] |$)\n",
      "source": "client.?secret.{0,10}\\b([a-z0-9_-]{24})(?:[^a-z0-9_-]|$)",
      "flags": "gdi",
      "fixtureCheck": {
        "positive": 3,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.google.4",
      "name": "Google OAuth Access Token",
      "file": "google.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(ya29\\.[0-9A-Za-z_-]{20,1024})\n(?: [^0-9A-Za-z_-]|$)  (?# Used instead of `\\b` because that doesn't play well with trailing `-` )\n",
      "source": "\\b(ya29\\.[0-9A-Za-z_-]{20,1024})(?:[^0-9A-Za-z_-]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.google.5",
      "name": "Google API Key",
      "file": "google.yml",
      "categories": [
        "api",
        "secret"
      ],
      "pattern": "(?x)\n\\b\n(AIza[0-9A-Za-z_-]{35})\n(?: [^0-9A-Za-z_-] | $ )\n",
      "source": "\\b(AIza[0-9A-Za-z_-]{35})(?:[^0-9A-Za-z_-]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 0,
        "passed": true
      }
    },
    {
      "id": "np.gcs.1",
      "name": "Google Cloud Storage Bucket",
      "file": "google.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?x)\n(?: ^ | [\\s/\"'] | %2F )\n(\n(?: [a-zA-Z0-9_-]+ \\. )+    (?# bucket name as subdomain )\nstorage\\.googleapis\\.com\n)\n\\b\n",
      "source": "(?:^|[\\s/\"']|%2F)((?:[a-zA-Z0-9_-]+\\.)+storage\\.googleapis\\.com)\\b",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 2,
        "negative": 1,
        "passed": true
      }
    },
    {
      "id": "np.gcs.2",
      "name": "Google Cloud Storage Bucket",
      "file": "google.yml",
      "categories": [
        "api",
        "identifier"
      ],
      "pattern": "(?x)\n(?: ^ | [\\s/\"'] | %2F )\n(\nstorage\\.googleapis\\.com\n/\n[a-zA-Z0-9_-]+ (?: \\. [a-zA-Z0-9_-]+ )*    (?# bucket name as path )\n)\n(?: [^a-zA-Z0-9_-] | $ )                   (?# this instead of a \\b anchor because that doesn't play nicely with `-` )\n",
      "source": "(?:^|[\\s/\"']|%2F)(storage\\.googleapis\\.com/[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9_-]+)*)(?:[^a-zA-Z0-9_-]|$)",
      "flags": "gd",
      "fixtureCheck": {
        "positive": 1,
        "negative": 2,
        "passed": true
      }
    }
  ],
  "skipped": [
    {
      "id": "np.aws.6",
      "name": "AWS API Credentials",
      "reason": "Unsupported regex syntax"
    },
    {
      "id": "np.google.6",
      "name": "Google OAuth Credentials",
      "reason": "Unsupported regex syntax"
    }
  ]
};
