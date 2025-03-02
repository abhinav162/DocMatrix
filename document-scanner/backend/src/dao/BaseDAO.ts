/**
 * Base Data Access Object interface
 * Defines common CRUD operations for all entities
 */
export interface BaseDAO<T, CreateParams, UpdateParams> {
  /**
   * Find an entity by its ID
   * @param id The entity ID
   * @returns The entity or null if not found
   */
  findById(id: number): Promise<T | null>;
  
  /**
   * Create a new entity
   * @param params Creation parameters
   * @returns The created entity
   */
  create(params: CreateParams): Promise<T>;
  
  /**
   * Update an existing entity
   * @param id The entity ID
   * @param params Update parameters
   * @returns The updated entity or null if not found
   */
  update(id: number, params: UpdateParams): Promise<T | null>;
  
  /**
   * Delete an entity by its ID
   * @param id The entity ID
   * @returns True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * Get all entities
   * @returns Array of entities
   */
  findAll(): Promise<T[]>;
}
