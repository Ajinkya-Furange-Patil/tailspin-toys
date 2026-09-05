import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
    getGamesByFilters,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

async function seedMixedGames(db: Database): Promise<{ categories: { strategy: { id: number }; puzzle: { id: number } }; publishers: { northwind: { id: number }; pinePeak: { id: number } } }> {
    const [strategyCategory] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [puzzleCategory] = await db
        .insert(categories)
        .values({ name: 'Puzzle', description: 'cat' })
        .returning({ id: categories.id });
    const [northwindPublisher] = await db
        .insert(publishers)
        .values({ name: 'Northwind', description: 'pub' })
        .returning({ id: publishers.id });
    const [pinePeakPublisher] = await db
        .insert(publishers)
        .values({ name: 'Pine Peak', description: 'pub' })
        .returning({ id: publishers.id });

    const gameFixtures = [
        { title: 'Alpha Tactics', categoryId: strategyCategory.id, publisherId: northwindPublisher.id },
        { title: 'Beta Tactics', categoryId: strategyCategory.id, publisherId: pinePeakPublisher.id },
        { title: 'Gamma Logic', categoryId: puzzleCategory.id, publisherId: northwindPublisher.id },
        { title: 'Delta Logic', categoryId: puzzleCategory.id, publisherId: pinePeakPublisher.id },
    ];

    for (const game of gameFixtures) {
        await db.insert(games).values({
            title: game.title,
            description: `${game.title} description`,
            starRating: 4.0,
            categoryId: game.categoryId,
            publisherId: game.publisherId,
        });
    }

    return {
        categories: {
            strategy: strategyCategory,
            puzzle: puzzleCategory,
        },
        publishers: {
            northwind: northwindPublisher,
            pinePeak: pinePeakPublisher,
        },
    };
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters games by category', async () => {
        const fixtures = await seedMixedGames(db);
        const filteredGames = await getGamesByFilters(db, {
            categoryIds: [fixtures.categories.strategy.id],
        });

        expect(filteredGames.map((game) => game.title)).toEqual(['Alpha Tactics', 'Beta Tactics']);
    });

    it('filters games by publisher', async () => {
        const fixtures = await seedMixedGames(db);
        const filteredGames = await getGamesByFilters(db, {
            publisherIds: [fixtures.publishers.northwind.id],
        });

        expect(filteredGames.map((game) => game.title)).toEqual(['Alpha Tactics', 'Gamma Logic']);
    });

    it('combines category and publisher filters', async () => {
        const fixtures = await seedMixedGames(db);
        const filteredGames = await getGamesByFilters(db, {
            categoryIds: [fixtures.categories.strategy.id],
            publisherIds: [fixtures.publishers.northwind.id],
        });

        expect(filteredGames.map((game) => game.title)).toEqual(['Alpha Tactics']);
    });

    it('returns an empty list when no games match the filters', async () => {
        await seedMixedGames(db);
        const filteredGames = await getGamesByFilters(db, {
            categoryIds: [9999],
            publisherIds: [9999],
        });

        expect(filteredGames).toEqual([]);
    });
});
