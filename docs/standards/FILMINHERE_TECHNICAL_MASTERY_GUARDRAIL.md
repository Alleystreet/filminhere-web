# FilmInHere Technical Mastery Guardrail Addendum

**Version:** v1.2  
**Status:** Draft — becomes locked when approved and merged  
**Project:** FilmInHere  
**Owner:** Alleystreet / FilmInHere  
**Inherits:** `docs/standards/ALLEYSTREET_UNIVERSAL_TECHNICAL_MASTERY_GUARDRAIL.md`

## 1. Precedence

FilmInHere inherits the Alleystreet Universal Technical Mastery Guardrail in full.

This addendum may make the universal standard stricter for FilmInHere. It may not weaken the universal requirements for Technical Mastery, Systems Integration (SI), Solutions Architecture (SA), security, evidence, reproducibility, owner independence, governance, or the Ownership -> Leverage path.

If this addendum and the universal guardrail appear to conflict, stop and resolve the conflict explicitly through version-controlled change control rather than guessing.

## 2. FilmInHere Product Boundary

FilmInHere is a production marketplace and project pipeline, not merely a location-listing website.

Architecture and database decisions must preserve the ability to support the broader FilmInHere system, including:

- locations;
- props;
- vehicles;
- equipment;
- services;
- talent and crew;
- vendors;
- area-based availability;
- creator/project records;
- rights;
- assets;
- deliverables;
- release destinations;
- readiness;
- educational/terminology support.

Project implementation must remain platform-neutral unless an approved requirement explicitly says otherwise.

## 3. FilmInHere Database Reconciliation Rule

The FilmInHere live database must not remain permanently ahead of source control.

The required reconciliation sequence is:

1. transcribe and review the Glenn source call;
2. inspect the Build Template page-by-page and visually where necessary;
3. capture the complete live Supabase schema;
4. inventory repository migrations;
5. extract project requirements;
6. build the schema gap matrix;
7. create and lock the Database Requirements Manifest;
8. maintain the Entity Relationship Diagram (ERD);
9. restore missing reproducible baseline migrations;
10. design and verify Row Level Security (RLS), grants, functions, triggers, constraints, and indexes;
11. create safe test data;
12. verify in a non-production environment where practical;
13. preserve rollback/recovery instructions;
14. capture the Standard Operating Procedure (SOP), runbook, evidence, and Technical Mastery notes.

Manual Structured Query Language (SQL) that materially changes the production data model must be reconciled into version-controlled migration history.

## 4. Client Delivery Boundary

Glenn/client delivery remains the active priority.

Technical Mastery must support the work without creating uncontrolled scope drift. Deep study may be deferred when necessary, but the commands, topology, architecture decisions, security reasoning, certification mappings, verification evidence, and reproducible knowledge trail must be preserved.

## 5. Evidence Standard

Substantial FilmInHere work should preserve, when relevant:

- commit SHA;
- Pull Request;
- deployment evidence;
- test output;
- database evidence;
- screenshots;
- logs;
- migration evidence;
- architecture/topology changes;
- security/trust-boundary changes;
- rollback/recovery notes;
- Technical Mastery stage;
- genuine certification objective/domain mapping;
- reusable SOP/runbook/ADR opportunities.

## 6. Change Control

This addendum is version-controlled.

Changes must be explicit, reviewed, evidence-based, and must not silently weaken the inherited universal guardrail.
