"use strict";
/**
 * Types TypeScript centralisés pour l'application
 *
 * Ce fichier définit tous les types, interfaces et enums utilisés dans l'application
 * pour assurer une cohérence et une sécurité de typage dans tout le codebase.
 *
 * @module types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportStatus = exports.ReportMethod = void 0;
exports.isValidReportMethod = isValidReportMethod;
exports.isAuthenticatedRequest = isAuthenticatedRequest;
const express_1 = require("express");
/**
 * Énumération des méthodes d'envoi de rapport
 */
var ReportMethod;
(function (ReportMethod) {
    ReportMethod["EMAIL"] = "email";
    ReportMethod["WHATSAPP"] = "whatsapp";
})(ReportMethod || (exports.ReportMethod = ReportMethod = {}));
/**
 * Énumération des statuts de rapport
 */
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["SENT"] = "sent";
    ReportStatus["FAILED"] = "failed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
/**
 * Type guard pour vérifier si une valeur est un ReportMethod valide
 */
function isValidReportMethod(value) {
    return Object.values(ReportMethod).includes(value);
}
/**
 * Type guard pour vérifier si une requête est authentifiée
 */
function isAuthenticatedRequest(req) {
    return 'user' in req && req.user !== undefined;
}
//# sourceMappingURL=index.js.map