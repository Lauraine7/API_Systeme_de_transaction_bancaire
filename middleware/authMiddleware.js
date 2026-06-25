const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_protege';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ erreur: 'Accès refusé, token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ erreur: 'Token invalide ou expiré' });
        req.user = user;
        next();
    });
};

const authorizeRole = (roleOrRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ erreur: 'Accès refusé' });
        }

        const allowed = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
        // Normalize to uppercase
        const allowedUpper = allowed.map(r => r.toUpperCase());
        const userRole = (req.user.role || '').toUpperCase();

        if (!allowedUpper.includes(userRole)) {
            return res.status(403).json({ erreur: `Accès réservé aux rôles: ${allowedUpper.join(', ')}` });
        }
        next();
    };
};

const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ erreur: 'Utilisateur non authentifié' });

    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.role?.toUpperCase());
    const targetAccountId = parseInt(req.params.id);
    const userAccountId = req.user.accountId;

    if (isAdmin || (userAccountId && userAccountId === targetAccountId)) {
        return next();
    }

    return res.status(403).json({ erreur: 'Accès refusé : vous devez être le propriétaire du compte ou administrateur' });
};

module.exports = { authenticateToken, authorizeRole, isOwnerOrAdmin, JWT_SECRET };
