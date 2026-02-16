import { test, expect } from '@playwright/test';

test.describe('Autenticación y Flujo Base', () => {
    test('debería mostrar la página de landing', async ({ page }) => {
        await page.goto('http://localhost:5173');
        await expect(page).toHaveTitle(/Cuentalo/);
    });

    test('debería permitir ir a la página de login', async ({ page }) => {
        await page.goto('http://localhost:5173');
        const loginBtn = page.locator('button:has-text("Comenzar")').first();
        if (await loginBtn.isVisible()) {
            await loginBtn.click();
            await expect(page).toHaveURL(/.*auth/);
        }
    });
});
