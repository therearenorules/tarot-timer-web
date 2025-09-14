import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../middleware/auth';

// Get all spreads for the authenticated user
export async function getSpreads(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { limit = '50', offset = '0', spreadType } = req.query;

    const whereClause: any = { userId };

    // Filter by spread type if provided
    if (spreadType && typeof spreadType === 'string') {
      whereClause.spreadType = spreadType;
    }

    const spreads = await prisma.spreadReading.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      select: {
        id: true,
        title: true,
        spreadType: true,
        spreadName: true,
        spreadNameEn: true,
        positions: true,
        insights: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalCount = await prisma.spreadReading.count({ where: whereClause });

    res.json({
      success: true,
      data: spreads.map(spread => ({
        id: spread.id,
        title: spread.title,
        spreadType: spread.spreadType,
        spreadName: spread.spreadName,
        spreadNameEn: spread.spreadNameEn,
        positions: spread.positions,
        insights: spread.insights || '',
        tags: spread.tags,
        createdAt: spread.createdAt.toISOString(),
        updatedAt: spread.updatedAt.toISOString()
      })),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Get spreads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve spreads',
      code: 'DATABASE_ERROR'
    });
  }
}

// Get a specific spread by ID
export async function getSpreadById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const spread = await prisma.spreadReading.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        title: true,
        spreadType: true,
        spreadName: true,
        spreadNameEn: true,
        positions: true,
        insights: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!spread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
        message: `No spread found with ID: ${id}`,
        code: 'SPREAD_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: spread.id,
        title: spread.title,
        spreadType: spread.spreadType,
        spreadName: spread.spreadName,
        spreadNameEn: spread.spreadNameEn,
        positions: spread.positions,
        insights: spread.insights || '',
        tags: spread.tags,
        createdAt: spread.createdAt.toISOString(),
        updatedAt: spread.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Get spread by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve spread',
      code: 'DATABASE_ERROR'
    });
  }
}

// Create a new spread
export async function createSpread(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const {
      id,
      title,
      spreadType,
      spreadName,
      spreadNameEn,
      positions,
      insights,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !spreadType || !spreadName || !positions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'title, spreadType, spreadName, and positions are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate positions array
    if (!Array.isArray(positions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid positions format',
        message: 'positions must be an array',
        code: 'INVALID_POSITIONS_FORMAT'
      });
    }

    // Create the spread
    const spread = await prisma.spreadReading.create({
      data: {
        id: id || undefined, // Let Prisma generate UUID if not provided
        userId,
        title,
        spreadType,
        spreadName,
        spreadNameEn: spreadNameEn || spreadName,
        positions,
        insights: insights || null,
        tags: tags || []
      },
      select: {
        id: true,
        title: true,
        spreadType: true,
        spreadName: true,
        spreadNameEn: true,
        positions: true,
        insights: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Spread created successfully',
      data: {
        id: spread.id,
        title: spread.title,
        spreadType: spread.spreadType,
        spreadName: spread.spreadName,
        spreadNameEn: spread.spreadNameEn,
        positions: spread.positions,
        insights: spread.insights || '',
        tags: spread.tags,
        createdAt: spread.createdAt.toISOString(),
        updatedAt: spread.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Create spread error:', error);

    // Handle unique constraint violations
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Spread with this ID already exists',
        code: 'SPREAD_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create spread',
      code: 'DATABASE_ERROR'
    });
  }
}

// Update an existing spread
export async function updateSpread(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const {
      title,
      spreadType,
      spreadName,
      spreadNameEn,
      positions,
      insights,
      tags
    } = req.body;

    // Check if spread exists and belongs to user
    const existingSpread = await prisma.spreadReading.findFirst({
      where: { id, userId }
    });

    if (!existingSpread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
        message: `No spread found with ID: ${id}`,
        code: 'SPREAD_NOT_FOUND'
      });
    }

    // Update the spread
    const updatedSpread = await prisma.spreadReading.update({
      where: { id },
      data: {
        title: title || existingSpread.title,
        spreadType: spreadType || existingSpread.spreadType,
        spreadName: spreadName || existingSpread.spreadName,
        spreadNameEn: spreadNameEn || existingSpread.spreadNameEn,
        positions: positions || existingSpread.positions,
        insights: insights !== undefined ? insights : existingSpread.insights,
        tags: tags || existingSpread.tags,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        spreadType: true,
        spreadName: true,
        spreadNameEn: true,
        positions: true,
        insights: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Spread updated successfully',
      data: {
        id: updatedSpread.id,
        title: updatedSpread.title,
        spreadType: updatedSpread.spreadType,
        spreadName: updatedSpread.spreadName,
        spreadNameEn: updatedSpread.spreadNameEn,
        positions: updatedSpread.positions,
        insights: updatedSpread.insights || '',
        tags: updatedSpread.tags,
        createdAt: updatedSpread.createdAt.toISOString(),
        updatedAt: updatedSpread.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Update spread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update spread',
      code: 'DATABASE_ERROR'
    });
  }
}

// Delete a spread
export async function deleteSpread(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if spread exists and belongs to user
    const existingSpread = await prisma.spreadReading.findFirst({
      where: { id, userId }
    });

    if (!existingSpread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
        message: `No spread found with ID: ${id}`,
        code: 'SPREAD_NOT_FOUND'
      });
    }

    // Delete the spread
    await prisma.spreadReading.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Spread deleted successfully',
      data: {
        deletedId: id,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete spread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete spread',
      code: 'DATABASE_ERROR'
    });
  }
}