import { test, expect, type Page } from '@playwright/test'

const recommendedDishes = [
  { name: '鎏金番茄鸳鸯锅', badge: '人气 No.1', description: '慢熬番茄与醇香牛油，一锅双味', price: '¥68.00 起' },
  { name: '牛油麻辣锅', badge: '招牌', description: '醇厚牛油，花椒与辣椒层层释香', price: '¥59.00 起' },
  { name: '琥珀嫩牛肉', badge: '主厨推荐', description: '鲜切嫩牛肉，涮煮约 30 秒', price: '¥42.00 起' },
]

const recommendedDishesEn = [
  { name: 'Golden Tomato Dual-Flavor Pot', badge: 'Top Pick', description: 'Slow-simmered tomato and rich beef tallow, two flavors in one pot' },
  { name: 'Beef Tallow Spicy Pot', badge: 'Signature', description: 'Rich beef tallow with layered Sichuan peppercorn and chili' },
  { name: 'Amber Tender Beef', badge: "Chef's Choice", description: 'Fresh-cut tender beef, blanch about 30 seconds' },
]

function recommendedSection(page: Page) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: '进店先看这一口' }) })
}

function recommendedCard(page: Page, name: string) {
  return page.locator('article').filter({ has: page.getByRole('heading', { name }) })
}

async function enterMenu(page: Page) {
  await page.getByRole('button', { name: /A08/ }).first().click()
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click()
}

test.describe('首页推荐菜展示', () => {
  test('REQ-001: 未绑定桌台时首页首屏可见推荐菜和桌台入口', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/#\/home$/)
    await expect(page.getByText('推荐菜')).toBeVisible()
    await expect(page.getByRole('heading', { name: '进店先看这一口' })).toBeVisible()
    await expect(page.getByText('绑定后即可点单')).toBeVisible()

    const section = recommendedSection(page)
    await expect(section.locator('article')).toHaveCount(3)
    for (const dish of recommendedDishes) {
      const card = recommendedCard(page, dish.name)
      await expect(card.getByRole('img', { name: dish.name })).toBeVisible()
      await expect(card.getByText(dish.badge)).toBeVisible()
      await expect(card.getByText(dish.description)).toBeVisible()
      await expect(card.getByText(dish.price)).toBeVisible()
    }

    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /快速进入 A08|Quick enter A08/ })).toBeVisible()
  })

  test('REQ-002: 推荐菜核心信息与菜单页对应菜品一致', async ({ page }) => {
    await page.goto('/')

    for (const dish of recommendedDishes) {
      const homeCard = recommendedCard(page, dish.name)
      await expect(homeCard.getByRole('heading', { name: dish.name })).toBeVisible()
      await expect(homeCard.getByText(dish.description)).toBeVisible()
      await expect(homeCard.getByText(dish.price)).toBeVisible()
    }

    await enterMenu(page)
    await expect(page).toHaveURL(/#\/menu$/)

    for (const dish of recommendedDishes) {
      const menuCard = recommendedCard(page, dish.name)
      await expect(menuCard.getByRole('img', { name: dish.name })).toBeVisible()
      await expect(menuCard.getByText(dish.badge)).toBeVisible()
      await expect(menuCard.getByText(dish.description)).toBeVisible()
      await expect(menuCard.getByText(dish.price)).toBeVisible()
    }
  })

  test('REQ-001: 英文语言下推荐菜文案和菜品信息同步展示', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'en')
    })
    await page.goto('/')

    await expect(page.getByText('Recommended Dishes')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Start with these favorites' })).toBeVisible()
    await expect(page.getByText('Order after binding')).toBeVisible()
    for (const dish of recommendedDishesEn) {
      const card = recommendedCard(page, dish.name)
      await expect(card.getByRole('img', { name: dish.name })).toBeVisible()
      await expect(card.getByText(dish.badge)).toBeVisible()
      await expect(card.getByText(dish.description)).toBeVisible()
    }
  })

  test('REQ-001: 推荐菜不影响桌台绑定后进入点餐流程', async ({ page }) => {
    await page.goto('/')
    await enterMenu(page)

    await expect(page).toHaveURL(/#\/menu$/)
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
  })
})
