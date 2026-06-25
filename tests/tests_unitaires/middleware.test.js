import { expect, it, describe, vi } from 'vitest';
const { authorizeRole } = require('../../middleware/authMiddleware');

describe('Auth Middleware Unit Tests', () => {
    it('authorizeRole doit retourner 403 si req.user est manquant', () => {
        const middleware = authorizeRole('ADMIN');
        const req = {}; // Pas de user
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ erreur: 'Accès refusé' });
        expect(next).not.toHaveBeenCalled();
    });

    it('authorizeRole doit utiliser une chaîne vide si req.user.role est falsy (null, undefined, empty)', () => {
        const middleware = authorizeRole('ADMIN');
        
        // Case null
        const res1 = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        middleware({ user: { role: null } }, res1, vi.fn());
        expect(res1.status).toHaveBeenCalledWith(403);

        // Case undefined
        const res2 = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        middleware({ user: { } }, res2, vi.fn());
        expect(res2.status).toHaveBeenCalledWith(403);

        // Case empty string for role
        const res3 = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        middleware({ user: { role: '' } }, res3, vi.fn());
        expect(res3.status).toHaveBeenCalledWith(403);
    });
});
