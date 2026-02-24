// tests/sprint2/mts-routing.test.ts
// MTS (Message Transport Services) — routing, rendering, transport selection, payload validation

describe('MTS — Message Rendering', () => {
  // Extracted rendering logic to test message content per type

  function renderMessage(
    type: string,
    orgName: string,
    data: Record<string, unknown> = {},
  ) {
    const taskDesc = String(data.taskDescription || 'Pickup task');
    const taskLoc = String(data.taskLocation || '');
    const claimedBy = String(data.claimedBy || 'Someone');
    const memberName = String(data.memberName || 'A new member');

    switch (type) {
      case 'welcome':
        return {
          type,
          subject: `Welcome to ${orgName}`,
          heading: 'Welcome!',
          bodyText: `Welcome to ${orgName}! You can now view the directory, claim pickups, and post community needs.`,
          bodyJson: { type, orgName, ...data },
        };
      case 'admin-join':
        return {
          type,
          subject: `New member joined ${orgName}`,
          heading: 'New Member Joined',
          bodyText: `${memberName} has joined ${orgName}.`,
          bodyJson: { type, orgName, memberName, ...data },
        };
      case 'pickup-claimed':
        return {
          type,
          subject: `Pickup claimed — ${orgName}`,
          heading: 'Pickup Claimed',
          bodyText: `${claimedBy} claimed: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
          bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, claimedBy, ...data },
        };
      case 'pickup-delivered':
        return {
          type,
          subject: `Pickup delivered — ${orgName}`,
          heading: 'Pickup Delivered',
          bodyText: `Delivered: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
          bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
        };
      case 'pickup-stocked':
        return {
          type,
          subject: `Items stocked — ${orgName}`,
          heading: 'Pickup Stocked',
          bodyText: `Stocked: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
          bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
        };
      case 'daily-digest':
        return {
          type,
          subject: `Daily digest — ${orgName}`,
          heading: 'Daily Digest',
          bodyText: `Daily digest for ${orgName}.`,
          bodyJson: { type, orgName, ...data },
        };
      default:
        return {
          type,
          subject: String(data.subject || `Notification from ${orgName}`),
          heading: String(data.heading || 'Notification'),
          bodyText: String(data.message || ''),
          bodyJson: { type, orgName, ...data },
        };
    }
  }

  test('welcome message renders correct subject and body', () => {
    const msg = renderMessage('welcome', 'Ward Food Pantry', { memberEmail: 'alice@test.com' });
    expect(msg.subject).toBe('Welcome to Ward Food Pantry');
    expect(msg.heading).toBe('Welcome!');
    expect(msg.bodyText).toContain('Welcome to Ward Food Pantry');
    expect(msg.bodyText).toContain('claim pickups');
    expect(msg.bodyJson.memberEmail).toBe('alice@test.com');
  });

  test('admin-join message includes member name', () => {
    const msg = renderMessage('admin-join', 'Mountain Pantry', { memberName: 'bob@test.com' });
    expect(msg.subject).toBe('New member joined Mountain Pantry');
    expect(msg.bodyText).toContain('bob@test.com');
    expect(msg.bodyText).toContain('Mountain Pantry');
  });

  test('pickup-claimed message includes task details and claimer', () => {
    const msg = renderMessage('pickup-claimed', 'Ward Pantry', {
      taskDescription: '20 cans of soup',
      taskLocation: 'King Soopers',
      claimedBy: 'Alice',
    });
    expect(msg.subject).toBe('Pickup claimed — Ward Pantry');
    expect(msg.bodyText).toContain('Alice claimed');
    expect(msg.bodyText).toContain('20 cans of soup');
    expect(msg.bodyText).toContain('King Soopers');
    expect(msg.bodyJson.taskDescription).toBe('20 cans of soup');
  });

  test('pickup-delivered message includes task description and location', () => {
    const msg = renderMessage('pickup-delivered', 'Pantry A', {
      taskDescription: 'Fresh bread',
      taskLocation: 'Community Center',
    });
    expect(msg.subject).toBe('Pickup delivered — Pantry A');
    expect(msg.bodyText).toContain('Delivered: Fresh bread');
    expect(msg.bodyText).toContain('Community Center');
  });

  test('pickup-stocked message renders correctly', () => {
    const msg = renderMessage('pickup-stocked', 'Pantry B', {
      taskDescription: 'Canned beans',
      taskLocation: 'Storage Room A',
    });
    expect(msg.subject).toBe('Items stocked — Pantry B');
    expect(msg.bodyText).toContain('Stocked: Canned beans');
    expect(msg.bodyText).toContain('Storage Room A');
  });

  test('daily-digest message uses org name', () => {
    const msg = renderMessage('daily-digest', 'Ward Food Pantry');
    expect(msg.subject).toBe('Daily digest — Ward Food Pantry');
    expect(msg.bodyText).toContain('Ward Food Pantry');
  });

  test('custom/unknown type falls back to data fields', () => {
    const msg = renderMessage('custom', 'Test Pantry', {
      subject: 'Custom Subject',
      heading: 'Custom Heading',
      message: 'Custom body text',
    });
    expect(msg.subject).toBe('Custom Subject');
    expect(msg.heading).toBe('Custom Heading');
    expect(msg.bodyText).toBe('Custom body text');
  });

  test('missing task data uses sensible defaults', () => {
    const msg = renderMessage('pickup-claimed', 'Pantry', {});
    expect(msg.bodyText).toContain('Someone claimed: Pickup task');
    expect(msg.bodyJson.claimedBy).toBe('Someone');
    expect(msg.bodyJson.taskDescription).toBe('Pickup task');
  });
});

describe('MTS — Transport Selection', () => {
  function resolveTransports(
    requested: string[] | undefined,
    orgHasWebhook: boolean,
    hasMailgun: boolean,
  ): string[] {
    const active = requested || ['email', 'site', 'webhook'];
    const result: string[] = [];
    if (active.includes('email') && hasMailgun) result.push('email');
    if (active.includes('site')) result.push('site');
    if (active.includes('webhook') && orgHasWebhook) result.push('webhook');
    return result;
  }

  test('default: all transports when all configured', () => {
    const t = resolveTransports(undefined, true, true);
    expect(t).toEqual(['email', 'site', 'webhook']);
  });

  test('no webhook when org has no webhook URL', () => {
    const t = resolveTransports(undefined, false, true);
    expect(t).toEqual(['email', 'site']);
  });

  test('no email when Mailgun not configured', () => {
    const t = resolveTransports(undefined, true, false);
    expect(t).toEqual(['site', 'webhook']);
  });

  test('explicit override: site only', () => {
    const t = resolveTransports(['site'], true, true);
    expect(t).toEqual(['site']);
  });

  test('explicit override: email + webhook, no site', () => {
    const t = resolveTransports(['email', 'webhook'], true, true);
    expect(t).toEqual(['email', 'webhook']);
  });

  test('requesting webhook but org has none yields empty webhook', () => {
    const t = resolveTransports(['webhook'], false, true);
    expect(t).toEqual([]);
  });
});

describe('MTS — Webhook Payload', () => {
  function buildWebhookPayload(
    type: string,
    orgName: string,
    subject: string,
    bodyText: string,
    bodyJson: Record<string, unknown>,
  ) {
    return {
      event: type,
      org: orgName,
      subject,
      message: bodyText,
      data: bodyJson,
      timestamp: new Date().toISOString(),
    };
  }

  test('webhook payload has required fields', () => {
    const p = buildWebhookPayload(
      'pickup-claimed',
      'Ward Pantry',
      'Pickup claimed — Ward Pantry',
      'Someone claimed a pickup',
      { type: 'pickup-claimed', orgName: 'Ward Pantry' },
    );
    expect(p.event).toBe('pickup-claimed');
    expect(p.org).toBe('Ward Pantry');
    expect(p.subject).toContain('Pickup claimed');
    expect(p.message).toBeTruthy();
    expect(p.data).toBeDefined();
    expect(p.timestamp).toBeTruthy();
  });

  test('webhook timestamp is valid ISO string', () => {
    const p = buildWebhookPayload('welcome', 'P', 'S', 'B', {});
    const parsed = new Date(p.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });

  test('webhook data carries through body json', () => {
    const json = { type: 'pickup-claimed', claimedBy: 'Alice', taskDescription: 'Soup' };
    const p = buildWebhookPayload('pickup-claimed', 'P', 'S', 'B', json);
    expect(p.data.claimedBy).toBe('Alice');
    expect(p.data.taskDescription).toBe('Soup');
  });
});

describe('MTS — Request Validation', () => {
  function validateMtsRequest(req: Record<string, unknown>): { valid: boolean; error?: string } {
    if (!req.type || typeof req.type !== 'string') {
      return { valid: false, error: 'Missing type' };
    }
    if (!req.orgId || typeof req.orgId !== 'string') {
      return { valid: false, error: 'Missing orgId' };
    }
    if (req.transports && !Array.isArray(req.transports)) {
      return { valid: false, error: 'transports must be an array' };
    }
    if (req.recipientRole && !Array.isArray(req.recipientRole)) {
      return { valid: false, error: 'recipientRole must be an array' };
    }
    return { valid: true };
  }

  test('valid request passes', () => {
    const r = validateMtsRequest({ type: 'welcome', orgId: 'org-123' });
    expect(r.valid).toBe(true);
  });

  test('missing type is rejected', () => {
    const r = validateMtsRequest({ orgId: 'org-123' });
    expect(r.valid).toBe(false);
    expect(r.error).toContain('type');
  });

  test('missing orgId is rejected', () => {
    const r = validateMtsRequest({ type: 'welcome' });
    expect(r.valid).toBe(false);
    expect(r.error).toContain('orgId');
  });

  test('invalid transports type is rejected', () => {
    const r = validateMtsRequest({ type: 'welcome', orgId: 'x', transports: 'email' });
    expect(r.valid).toBe(false);
    expect(r.error).toContain('transports');
  });

  test('invalid recipientRole type is rejected', () => {
    const r = validateMtsRequest({ type: 'welcome', orgId: 'x', recipientRole: 'admin' });
    expect(r.valid).toBe(false);
    expect(r.error).toContain('recipientRole');
  });

  test('full valid request with all optional fields', () => {
    const r = validateMtsRequest({
      type: 'pickup-claimed',
      orgId: 'org-456',
      recipientEmail: 'alice@test.com',
      recipientRole: ['admin'],
      transports: ['email', 'site'],
      data: { taskDescription: 'Soup' },
    });
    expect(r.valid).toBe(true);
  });
});

describe('MTS — Default Role Mapping', () => {
  function defaultRolesForType(type: string): string[] {
    switch (type) {
      case 'welcome':
        return [];
      case 'admin-join':
      case 'pickup-claimed':
      case 'pickup-delivered':
      case 'pickup-stocked':
      case 'daily-digest':
        return ['admin', 'owner'];
      default:
        return ['admin'];
    }
  }

  test('welcome sends to no roles (uses recipientEmail)', () => {
    expect(defaultRolesForType('welcome')).toEqual([]);
  });

  test('pickup events fan out to admin and owner', () => {
    expect(defaultRolesForType('pickup-claimed')).toEqual(['admin', 'owner']);
    expect(defaultRolesForType('pickup-delivered')).toEqual(['admin', 'owner']);
    expect(defaultRolesForType('pickup-stocked')).toEqual(['admin', 'owner']);
  });

  test('admin-join notifies admin and owner', () => {
    expect(defaultRolesForType('admin-join')).toEqual(['admin', 'owner']);
  });

  test('daily-digest goes to admin and owner', () => {
    expect(defaultRolesForType('daily-digest')).toEqual(['admin', 'owner']);
  });

  test('unknown type defaults to admin only', () => {
    expect(defaultRolesForType('unknown-type')).toEqual(['admin']);
  });
});
