import { test, expect } from '@playwright/test';

test.describe('Eloquent One — Golden Path End-to-End Journey', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock MediaPipe scripts for deterministic, instant engine initialization without external CDN latency
    await page.addInitScript(() => {
      class MockMediaPipe {
        fn: any = null;
        setOptions() {}
        onResults(fn: any) {
          this.fn = fn;
        }
        async send() {
          if (this.fn) {
            this.fn({
              image: {},
              multiFaceLandmarks: [
                [
                  { x: 0.5, y: 0.5 },
                  { x: 0.49, y: 0.5 },
                  { x: 0.51, y: 0.5 },
                  { x: 0.5, y: 0.48 },
                  { x: 0.5, y: 0.52 },
                  { x: 0.48, y: 0.5 },
                  { x: 0.52, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.5 },
                  { x: 0.5, y: 0.49 },
                  { x: 0.5, y: 0.51 }
                ]
              ]
            });
          }
        }
      }

      const w = window as any;
      w.FaceMesh = MockMediaPipe;
      w.Hands = MockMediaPipe;
      w.Pose = MockMediaPipe;
      w.drawConnectors = () => {};
      w.FACEMESH_TESSELATION = [];
      w.POSE_CONNECTIONS = [];
      w.HAND_CONNECTIONS = [];
    });

    // 2. Mock REST API session endpoint for deterministic results page rendering
    await page.route('**/api/session/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'golden-path-e2e-session',
            user_id: 1,
            session_label: 'E2E Golden Path Test',
            practice_context: 'Job Interview',
            duration_seconds: 45,
            overall_score: 88,
            speech_score: 22,
            facial_score: 18,
            gesture_score: 12,
            posture_score: 8,
            content_score: 28,
            communication_grade: 'Advanced Communicator',
            eye_contact_score: 92,
            filler_words_count: 1,
            transcript: 'Hello, I am demonstrating the golden path user journey in Playwright.',
            timeline_events: [],
            behavioral_flags: [],
            feedback_summary: JSON.stringify({
              wpm: 142,
              strengths: ['Maintained strong eye contact', 'Clear pacing and minimal fillers'],
              weaknesses: ['Slight facial tension'],
              tips: ['Relax shoulders before speaking'],
              feedback_summary: 'Excellent performance during this practice session.',
              caf_breakdown: {}
            })
          })
        });
      } else {
        await route.fulfill({ status: 200, json: { status: 'success' } });
      }
    });

    // Mock API health endpoint
    await page.route('**/api/health', async (route) => {
      await route.fulfill({ status: 200, json: { status: 'ok' } });
    });
  });

  test('Complete Golden Path: Landing → Practice Setup → Live Session → Processing → Results Report', async ({ page }) => {
    // Step 1: Landing Page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Speak with');
    await expect(page.locator('h1')).toContainText('Confidence');

    // Step 2: Navigate to Practice / Guest Setup
    const startPracticeBtn = page.getByRole('button', { name: /Start Practising Free/i }).first();
    await expect(startPracticeBtn).toBeVisible();
    await startPracticeBtn.click();

    // Handle Auth Modal guest entry option if displayed
    const tryItOutBtn = page.getByRole('button', { name: /Try it Out/i });
    if (await tryItOutBtn.isVisible()) {
      await tryItOutBtn.click();
    }

    if (!page.url().includes('/v2/practice')) {
      await page.goto('/v2/practice');
    }

    // Verify navigation to practice page
    await expect(page).toHaveURL(/\/v2\/practice/);

    // Step 3: Setup Modal Selection
    const modalDialog = page.getByRole('dialog', { name: /Session setup/i });
    await expect(modalDialog).toBeVisible();

    const nameInput = page.locator('#session-name');
    await nameInput.fill('E2E Golden Path Test');

    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await continueBtn.click();
    await continueBtn.click();

    const enterEnvBtn = page.getByRole('button', { name: /Enter Coaching Environment/i });
    await enterEnvBtn.click();

    // Step 4: Coaching Environment & Camera Stage
    await expect(page.getByRole('heading', { name: /Coaching Environment/i })).toBeVisible();
    await expect(page.getByText('E2E Golden Path Test')).toBeVisible();

    // Step 5: Start Session
    const startSessionBtn = page.getByRole('button', { name: /Start Practice/i });
    await expect(startSessionBtn).toBeVisible({ timeout: 15000 });
    await startSessionBtn.click();

    // Step 6: Session Recording State & Simulated Telemetry
    await page.waitForTimeout(2000);
    const endSessionBtn = page.getByRole('button', { name: /End Session/i });
    await expect(endSessionBtn).toBeVisible();

    // Step 7: End Session & Processing State
    await endSessionBtn.click();

    // Verify processing overlay appears
    const processingStatus = page.getByRole('status');
    await expect(processingStatus).toBeVisible();
    await expect(page.getByText(/Building your report/i)).toBeVisible();

    // Step 8: Results Page Navigation & Validation
    await expect(page).toHaveURL(/\/v2\/results\//, { timeout: 25000 });
    await expect(page.getByText(/Session Intelligence Report/i)).toBeVisible();
    await expect(page.locator('h1')).toContainText('E2E Golden Path Test');
    await expect(page.getByText(/Job Interview/i)).toBeVisible();
    await expect(page.getByText(/Grade Advanced Communicator/i)).toBeVisible();
    await expect(page.getByText(/Start New Session/i)).toBeVisible();
  });

  test('Results → Practice Handoff: pre-selected goal and handoff banner appear in setup modal', async ({ page }) => {
    // Navigate directly to Practice with goal + context query params (as Results CTA would link)
    await page.goto('/v2/practice?goal=pace&context=interview');

    // Setup modal should appear
    const modal = page.getByRole('dialog', { name: /Session setup/i });
    await expect(modal).toBeVisible({ timeout: 8000 });

    // Handoff banner should confirm the pre-selected goal
    await expect(modal.getByText(/Continuing from your last session/i)).toBeVisible();
    await expect(modal.getByText(/Slow down my pace/i)).toBeVisible();
  });
});
