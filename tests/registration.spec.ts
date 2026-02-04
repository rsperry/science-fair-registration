import { test, expect, Page } from '@playwright/test';

// Helper function to fill a student form
async function fillPrimaryStudent(page: Page, data: { name: string; projectName?: string; parentName: string; parentEmail: string }) {
  await page.getByRole('textbox', { name: 'Student Name' }).fill(data.name);

  // Select teacher - click the combobox
  await page.getByRole('combobox', { name: 'Teacher' }).click();
  await page.getByRole('option').first().waitFor({ state: 'visible' });
  await page.getByRole('option').first().click();

  if (data.projectName) {
    await page.getByRole('textbox', { name: 'Project Name' }).fill(data.projectName);
  }

  await page.getByRole('textbox', { name: 'Parent/Guardian Name' }).fill(data.parentName);
  await page.getByRole('textbox', { name: 'Parent/Guardian Email' }).fill(data.parentEmail);
}

async function fillAdditionalStudent(page: Page, index: number, data: { name: string; parentName?: string; parentEmail?: string }) {
  // For additional students, the index starts at 0, but display is "Student 2", "Student 3", etc.
  // Use specific role-based selectors instead of relying on a broad box locator
  await page.getByRole('textbox', { name: new RegExp(`Student ${index + 2} Name`, 'i') }).fill(data.name);

  await page.getByRole('combobox', { name: new RegExp(`Student ${index + 2} Teacher`, 'i') }).click();
  await page.getByRole('option').first().waitFor({ state: 'visible' });
  await page.getByRole('option').first().click();

  if (data.parentName) {
    await page.getByRole('textbox', { name: new RegExp(`Student ${index + 2} Parent.*Name`, 'i') }).fill(data.parentName);
  }

  if (data.parentEmail) {
    await page.getByRole('textbox', { name: new RegExp(`Student ${index + 2} Parent.*Email`, 'i') }).fill(data.parentEmail);
  }
}

// Students 2, 3, and 4
const additionalStudents = [
  { name: 'Charlie Brown', parentName: 'David Brown', parentEmail: 'david.brown@example.com' },
  { name: 'Emma Wilson', parentName: 'Frank Wilson', parentEmail: 'frank.wilson@example.com' },
  { name: 'Grace Lee', parentName: 'Henry Lee', parentEmail: 'henry.lee@example.com' }
];

test.describe('Science Fair Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Wait for home page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Wait for backend API call to complete
    await expect(page.getByRole('heading', { name: /Washington Science Fair/i })).toBeVisible({timeout: 10000});
    
    await page.getByRole('button', { name: 'Register Your Project' }).click();
    
    // Wait for registration page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Science Fair Project Registration/i })).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('combobox', { name: 'Teacher' })).toBeEnabled({ timeout: 10000 });
  });

  test.afterEach(async () => {
    // Wait 15 seconds after each test to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 30000));
  });

  test('should successfully register a project with 1 student', async ({ page }) => {
    const timestamp = Date.now();
    await fillPrimaryStudent(page, {
      name: `Alice Johnson ${timestamp}`,
      projectName: `Volcano Eruption Study ${timestamp}`,
      parentName: 'Bob Johnson',
      parentEmail: `bob.johnson${timestamp}@example.com`
    });

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // Wait for confirmation page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Registration Successful/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Project ID:/i)).toBeVisible();
  });

  test('should successfully register a project with 2 students', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      projectName: 'Robotics Project',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    for (let i = 0; i < 1; i++) {
      await page.getByRole('button', { name: /Add Group Member/i }).click();
      await expect(page.getByRole('heading', { name: `Student ${i + 2}` })).toBeVisible();
      await fillAdditionalStudent(page, i, additionalStudents[i]);
    }
    // Verify that Add Group Member button is still visible
    await expect(page.getByRole('button', { name: /Add Group Member/i })).toBeVisible();

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // Wait for confirmation page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Registration Successful/i })).toBeVisible({ timeout: 10000 });
  });

  test('should successfully register a project with 3 students', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      projectName: 'Robotics Project',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /Add Group Member/i }).click();
      await expect(page.getByRole('heading', { name: `Student ${i + 2}` })).toBeVisible();
      await fillAdditionalStudent(page, i, additionalStudents[i]);
    }
    // Verify that Add Group Member button is still visible
    await expect(page.getByRole('button', { name: /Add Group Member/i })).toBeVisible();

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // Wait for confirmation page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Registration Successful/i })).toBeVisible({ timeout: 30000 });
  });

  test('should successfully register a project with 4 students (maximum)', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      projectName: 'Robotics Project',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /Add Group Member/i }).click();
      await expect(page.getByRole('heading', { name: `Student ${i + 2}` })).toBeVisible();
      await fillAdditionalStudent(page, i, additionalStudents[i]);
    }
    // Verify that Add Group Member button is not visible after 4 students
    await expect(page.getByRole('button', { name: /Add Group Member/i })).not.toBeVisible();

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // Wait for confirmation page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Registration Successful/i })).toBeVisible({ timeout: 30000 });
  });

  test('should handle backend failure gracefully', async ({ page }) => {
    // Intercept the API call and make it fail
    await page.route('**/api/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      });
    });

    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // Verify error message is displayed
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Registration Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Wait for home page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Wait for backend API call to complete
    await expect(page.getByRole('heading', { name: /Washington Science Fair/i })).toBeVisible({ timeout: 10000 });
    
    await page.getByRole('button', { name: 'Register Your Project' }).click();
    
    // Wait for registration page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Science Fair Project Registration/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('combobox', { name: 'Teacher' })).toBeEnabled({ timeout: 10000 });
  });

  test.afterEach(async () => {
    // Wait 5 seconds after each test to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  test('should validate student name is required', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/student name is required/i)).toBeVisible();
  });

  test('should validate teacher is required', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Student Name' }).fill('Alice Johnson');
    await page.getByRole('textbox', { name: 'Parent/Guardian Name' }).fill('Bob Johnson');
    await page.getByRole('textbox', { name: 'Parent/Guardian Email' }).fill('bob.johnson@example.com');
    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();

    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/teacher.*required/i)).toBeVisible();
  });

  test('should validate parent/guardian name is required', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Student Name' }).fill('Alice Johnson');
    await page.getByRole('combobox', { name: 'Teacher' }).click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    await page.getByRole('textbox', { name: 'Parent/Guardian Email' }).fill('bob.johnson@example.com');
    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();

    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/parent.*guardian.*name.*required/i)).toBeVisible();
  });

  test('should validate parent/guardian email is required', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Student Name' }).fill('Alice Johnson');
    await page.getByRole('combobox', { name: 'Teacher' }).click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    await page.getByRole('textbox', { name: 'Parent/Guardian Name' }).fill('Bob Johnson');
    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();

    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/parent.*guardian.*email.*required/i)).toBeVisible();
  });

  test('should validate parent/guardian email format', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Student Name' }).fill('Alice Johnson');
    await page.getByRole('combobox', { name: 'Teacher' }).click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    await page.getByRole('textbox', { name: 'Parent/Guardian Name' }).fill('Bob Johnson');
    await page.getByRole('textbox', { name: 'Parent/Guardian Email' }).fill('invalid-email');
    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();

    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should validate consent checkbox is required', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Student Name' }).fill('Alice Johnson');
    await page.getByRole('combobox', { name: 'Teacher' }).click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    await page.getByRole('textbox', { name: 'Parent/Guardian Name' }).fill('Bob Johnson');
    await page.getByRole('textbox', { name: 'Parent/Guardian Email' }).fill('bob.johnson@example.com');

    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/you must give consent/i)).toBeVisible();
  });

  test('should validate additional student name when adding students', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    // Add second student but leave name empty
    await page.getByRole('button', { name: /Add Group Member/i }).click();
    await expect(page.getByRole('heading', { name: 'Student 2' })).toBeVisible();

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/student name is required/i)).toBeVisible();
  });

  test('should validate additional student teacher when adding students', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    // Add second student but leave teacher empty
    await page.getByRole('button', { name: /Add Group Member/i }).click();
    await expect(page.getByRole('heading', { name: 'Student 2' })).toBeVisible();
    
    // Fill name but leave teacher empty
    await page.getByRole('textbox', { name: /Student 2 Name/i }).fill('Charlie Brown');

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    // TO: Implement validation message for missing teacher
  });

  test('should validate additional student email format if provided', async ({ page }) => {
    await fillPrimaryStudent(page, {
      name: 'Alice Johnson',
      parentName: 'Bob Johnson',
      parentEmail: 'bob.johnson@example.com'
    });

    await page.getByRole('button', { name: /Add Group Member/i }).click();
    await expect(page.getByRole('heading', { name: 'Student 2' })).toBeVisible();

    // Fill student 2 with invalid email
    await page.getByRole('textbox', { name: /Student 2 Name/i }).fill('Charlie Brown');
    await page.getByRole('combobox', { name: /Student 2 Teacher/i }).click();
    await page.getByRole('option').first().waitFor({ state: 'visible' });
    await page.getByRole('option').first().click();
    await page.getByRole('textbox', { name: /Student 2 Parent.*Email/i }).fill('invalid-email');

    await page.getByRole('checkbox', { name: 'Consent to terms' }).check();
    await page.getByRole('button', { name: 'Submit Registration' }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});