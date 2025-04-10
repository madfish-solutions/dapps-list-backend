import { Request, Router } from 'express';
import { identity } from 'lodash';

import {
  adProvidersForAllSitesMethods,
  adProvidersMethods,
  adProvidersByDomainRulesMethods,
  AdProviderSelectorsRule,
  filterRules,
  AdProvidersByDomainRule,
  adProvidersCategoriesMethods
} from '../../advertising/external-ads';
import {
  addObjectStorageMethodsToRouter,
  addSetStorageMethodsToRouter,
  withExceptionHandler
} from '../../utils/express-helpers';
import { isDefined, transformValues } from '../../utils/helpers';
import {
  nonEmptyStringsListSchema,
  hostnamesListSchema,
  adProvidersByDomainsRulesDictionarySchema,
  adProvidersDictionarySchema,
  adProvidersCategoriesDictionarySchema
} from '../../utils/schemas';

/**
 * @swagger
 * tags:
 *   name: Known ads providers
 * components:
 *   schemas:
 *     AdProvidersByDomainRule:
 *       type: object
 *       required:
 *         - urlRegexes
 *         - providers
 *       properties:
 *         urlRegexes:
 *           type: array
 *           items:
 *             type: string
 *             format: regex
 *         providers:
 *           type: array
 *           items:
 *             type: string
 *       example:
 *         urlRegexes:
 *           - '^https://polygonscan\.com/?$'
 *         providers:
 *           - 'coinzilla'
 *           - 'bitmedia'
 *     AdProvidersByDomainsRulesDictionary:
 *       type: object
 *       additionalProperties:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/AdProvidersByDomainRule'
 *       example:
 *         polygonscan.com:
 *           - urlRegexes:
 *               - '^https://polygonscan\.com/?$'
 *             providers:
 *               - 'coinzilla'
 *               - 'bitmedia'
 *     AdProvidersInputValue:
 *       allOf:
 *         - $ref: '#/components/schemas/ExtVersionConstraints'
 *         - type: object
 *           required:
 *             - selectors
 *           properties:
 *             selectors:
 *               type: array
 *               items:
 *                 type: string
 *             negativeSelectors:
 *               descriptions: Selectors for the elements that should not be touched even if they match `selectors`
 *               type: array
 *               items:
 *                 type: string
 *             parentDepth:
 *               type: integer
 *               minimum: 0
 *               default: 0
 *             enableForMises:
 *               type: boolean
 *               default: true
 *             enableForNonMises:
 *               type: boolean
 *               default: true
 *     AdByProviderSelector:
 *       oneOf:
 *         - type: string
 *         - type: object
 *           required:
 *             - selector
 *             - parentDepth
 *           properties:
 *             selector:
 *               type: string
 *             parentDepth:
 *               type: integer
 *     AdProvidersDictionary:
 *       type: object
 *       additionalProperties:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/AdByProviderSelector'
 *       example:
 *         google:
 *           - '#Ads_google_bottom_wide'
 *           - '.GoogleAdInfo'
 *           - 'a[href^="https://googleads.g.doubleclick.net/pcs/click"]'
 *         persona:
 *           - selector: "a.persona-product"
 *             parentDepth: 1
 *     AdProvidersInputsDictionary:
 *       type: object
 *       additionalProperties:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/AdProvidersInputValue'
 *     AdProvidersCategoriesDictionary:
 *       type: object
 *       additionalProperties:
 *         type: array
 *         items:
 *           type: string
 */

export const adProvidersRouter = Router();

/**
 * @swagger
 * /api/slise-ad-rules/providers/all-sites:
 *   get:
 *     summary: Get providers of ads for which ads should be replaced at all sites
 *     tags:
 *       - Known ads providers
 *     responses:
 *       '200':
 *         description: List of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - 'coinzilla'
 *                 - 'bitmedia'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   post:
 *     summary: >
 *       Add providers of ads for which ads should be replaced at all sites. They will not be removed
 *       from lists of providers from specific sites. Checks for providers existence are not performed
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: List of providers
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example:
 *               - 'coinzilla'
 *               - 'bitmedia'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   delete:
 *     summary: Remove providers of ads for which ads should be replaced at all sites
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: List of providers
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             - 'coinzilla'
 *             - 'bitmedia'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
addSetStorageMethodsToRouter(adProvidersRouter, {
  path: '/all-sites',
  methods: adProvidersForAllSitesMethods,
  arrayValidationSchema: nonEmptyStringsListSchema,
  successfulAdditionMessage: addedEntriesCount => `${addedEntriesCount} providers have been added`,
  successfulRemovalMessage: removedEntriesCount => `${removedEntriesCount} providers have been removed`
});

/**
 * @swagger
 * /api/slise-ad-rules/providers/by-sites/{domain}:
 *   get:
 *     summary: Get rules for providers of ads for which ads should be replaced at the specified site
 *     tags:
 *       - Known ads providers
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *           format: hostname
 *         example: 'goerli.etherscan.io'
 *     responses:
 *       '200':
 *         description: Rules list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdProvidersByDomainRule'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 * /api/slise-ad-rules/providers/by-sites:
 *   get:
 *     summary: Get rules for providers of ads for which ads should be replaced at all sites
 *     tags:
 *       - Known ads providers
 *     responses:
 *       '200':
 *         description: Domain - rules list dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdProvidersByDomainsRulesDictionary'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   post:
 *     summary: >
 *       Add rules for providers of ads for the specified sites. They will not be removed from lists
 *       of providers from all sites. Checks for providers existence are not performed
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: Domain - rules list dictionary
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdProvidersByDomainsRulesDictionary'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   delete:
 *     summary: Remove rules for providers of ads for the specified sites
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: List of domains
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               format: hostname
 *             example:
 *               - 'goerli.etherscan.io'
 *               - 'polygonscan.com'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
addObjectStorageMethodsToRouter<AdProvidersByDomainRule[]>(adProvidersRouter, {
  path: '/by-sites',
  methods: adProvidersByDomainRulesMethods,
  keyName: 'domain',
  objectValidationSchema: adProvidersByDomainsRulesDictionarySchema,
  keysArrayValidationSchema: hostnamesListSchema,
  successfulRemovalMessage: entriesCount => `${entriesCount} entries have been removed`,
  valueTransformFn: identity,
  objectTransformFn: identity
});

/**
 * @swagger
 * /api/slise-ad-rules/providers/categories:
 *   get:
 *     summary: Get categories for providers
 *     tags:
 *       - Known ads providers
 *     responses:
 *       '200':
 *         description: Provider - categories dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdProvidersCategoriesDictionary'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   post:
 *     summary: Upsert categories for providers
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: Provider - categories dictionary
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdProvidersCategoriesDictionary'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   delete:
 *     summary: Delete categories for providers
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: List of provider IDs for which categories should be deleted
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
addObjectStorageMethodsToRouter<string[]>(adProvidersRouter, {
  path: '/categories',
  methods: adProvidersCategoriesMethods,
  keyName: 'providerId',
  objectValidationSchema: adProvidersCategoriesDictionarySchema,
  keysArrayValidationSchema: nonEmptyStringsListSchema,
  successfulRemovalMessage: entriesCount => `${entriesCount} entries have been removed`,
  valueTransformFn: identity,
  objectTransformFn: identity
});

/**
 * @swagger
 * /api/slise-ad-rules/providers/negative-selectors:
 *   get:
 *     summary: Get negative selectors for all providers filtered by extension version
 *     tags:
 *       - Known ads providers
 *     parameters:
 *       - in: query
 *         name: extVersion
 *         schema:
 *           type: string
 *           default: '0.0.0'
 *         description: The extension version for which the rules should be returned
 *     responses:
 *       '200':
 *         description: Provider - selectors dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdProvidersDictionary'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
adProvidersRouter.get(
  '/negative-selectors',
  withExceptionHandler(async (req, res) => {
    const allRules = await adProvidersMethods.getAllValues();

    const entries = Object.entries(allRules).map(([providerId, providerRules]): [string, string[]] => [
      providerId,
      filterRules(providerRules, req.query.extVersion as string | undefined)
        .map(({ negativeSelectors }) => negativeSelectors ?? [])
        .flat()
    ]);

    res.status(200).send(Object.fromEntries(entries));
  })
);

/**
 * @swagger
 * /api/slise-ad-rules/providers/raw/all:
 *   get:
 *     summary: Get selectors for all providers and all extensions versions
 *     tags:
 *       - Known ads providers
 *     responses:
 *       '200':
 *         description: Provider - selectors dictionary
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/AdProvidersInputsDictionary'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 * /api/slise-ad-rules/providers/{providerId}/raw:
 *   get:
 *     summary: Get selectors for a provider for all extensions versions
 *     tags:
 *       - Known ads providers
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 'google'
 *     responses:
 *       '200':
 *         description: Lists of CSS selectors for all extension versions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/AdProvidersInputValue'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 * /api/slise-ad-rules/providers/{providerId}:
 *   get:
 *     summary: Get selectors for a provider filtered by extension version
 *     tags:
 *       - Known ads providers
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 'google'
 *       - in: query
 *         name: extVersion
 *         schema:
 *           type: string
 *           default: '0.0.0'
 *         description: The extension version for which the rules should be returned
 *       - in: query
 *         name: isMisesBrowser
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: List of CSS selectors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdByProviderSelector'
 *               example:
 *                 - '#Ads_google_bottom_wide'
 *                 - '.GoogleAdInfo'
 *                 - 'a[href^="https://googleads.g.doubleclick.net/pcs/click"]'
 *                 - selector: "a.persona-product"
 *                   parentDepth: 1
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 * /api/slise-ad-rules/providers:
 *   get:
 *     summary: Get selectors for all providers filtered by extension version
 *     tags:
 *       - Known ads providers
 *     parameters:
 *       - in: query
 *         name: extVersion
 *         schema:
 *           type: string
 *           default: '0.0.0'
 *         description: The extension version for which the rules should be returned
 *       - in: query
 *         name: isMisesBrowser
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: Provider - selectors dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdProvidersDictionary'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   post:
 *     summary: Upserts providers. Providers that have existed before will be overwritten
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: Provider - selectors dictionary
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdProvidersInputsDictionary'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 *   delete:
 *     summary: Delete specified providers. Cascade delete rules are not applied
 *     tags:
 *       - Known ads providers
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       description: List of provider IDs to delete
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             - 'coinzilla'
 *             - 'bitmedia'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
const transformAdProviderSelectorsRules = (rules: AdProviderSelectorsRule[], req: Request) =>
  Array.from(
    new Set(
      filterRules(rules, req.query.extVersion as string | undefined, req.query.isMisesBrowser === 'true')
        .map(({ selectors, parentDepth }) =>
          isDefined(parentDepth) && parentDepth > 0 ? { selector: selectors.join(', '), parentDepth } : selectors
        )
        .flat()
    )
  );

type AdByProviderSelector = string | { selector: string; parentDepth: number };

addObjectStorageMethodsToRouter<
  AdProviderSelectorsRule[],
  Record<string, AdByProviderSelector[]>,
  AdByProviderSelector[]
>(adProvidersRouter, {
  path: '/',
  methods: adProvidersMethods,
  keyName: 'providerId',
  objectValidationSchema: adProvidersDictionarySchema,
  keysArrayValidationSchema: nonEmptyStringsListSchema,
  successfulRemovalMessage: entriesCount => `${entriesCount} providers have been removed`,
  valueTransformFn: transformAdProviderSelectorsRules,
  objectTransformFn: (rules, req) => transformValues(rules, value => transformAdProviderSelectorsRules(value, req))
});
