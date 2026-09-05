import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Category, Game, Publisher } from '../types/game';

export interface GameFilters {
    categoryIds?: number[];
    publisherIds?: number[];
}

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function normalizeFilterIds(ids: number[] | undefined): number[] {
    return [...new Set((ids ?? []).filter((id) => Number.isInteger(id) && id > 0))];
}

function buildGameFilterClause(filters: GameFilters): ReturnType<typeof and> | undefined {
    const categoryIds = normalizeFilterIds(filters.categoryIds);
    const publisherIds = normalizeFilterIds(filters.publisherIds);
    const predicates = [];

    if (categoryIds.length > 0) {
        predicates.push(inArray(games.categoryId, categoryIds));
    }

    if (publisherIds.length > 0) {
        predicates.push(inArray(games.publisherId, publisherIds));
    }

    if (predicates.length === 0) {
        return undefined;
    }

    return and(...predicates);
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Return all games ordered by title, optionally narrowed to one or more category and publisher ids.
 *
 * @param db - Database connection used for the query.
 * @param filters - Optional set of category and publisher ids to include.
 * @returns Games matching the applied filters in alphabetical title order.
 */
export async function getGamesByFilters(db: Database, filters: GameFilters = {}): Promise<Game[]> {
    const query = baseGamesQuery(db);
    const filterClause = buildGameFilterClause(filters);
    const rows = await (filterClause ? query.where(filterClause) : query).orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * Return all games in a stable alphabetical order.
 *
 * @param db - Database connection used for the query.
 * @returns Every game in the catalog ordered by title.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    return getGamesByFilters(db);
}

/**
 * Return all categories in alphabetical order.
 *
 * @param db - Database connection used for the query.
 * @returns Every category with its id and name.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    const rows = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
    return rows;
}

/**
 * Return all publishers in alphabetical order.
 *
 * @param db - Database connection used for the query.
 * @returns Every publisher with its id and name.
 */
export async function getAllPublishers(db: Database): Promise<Publisher[]> {
    const rows = await db.select({ id: publishers.id, name: publishers.name }).from(publishers).orderBy(asc(publishers.name));
    return rows;
}

/**
 * Return all game ids ordered by title.
 *
 * @param db - Database connection used for the query.
 * @returns A list of game ids in deterministic title order.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * Return a single game by id, or null when it does not exist.
 *
 * @param db - Database connection used for the query.
 * @param id - Unique game id to look up.
 * @returns The matching game, or null when no game is found.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
