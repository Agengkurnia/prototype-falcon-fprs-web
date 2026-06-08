/**
 * Headless test runner for Property 4: Status filter predicate correctness.
 * Runs directly in Node.js using fast-check.
 */
const fc = require('fast-check');

// ============================================================
// PURE FUNCTIONS UNDER TEST (copied from tests.html)
// ============================================================

/**
 * Status filter predicate: checks endTime for checkout status.
 * filterStatus: '' (all), 'sudah' (non-empty endTime), 'belum' (empty endTime)
 */
function statusFilterPredicate(rowEndTime, filterStatus) {
    if (!filterStatus) return true; // No filter = pass-through
    if (filterStatus === 'sudah') return !!rowEndTime;
    if (filterStatus === 'belum') return !rowEndTime;
    return true;
}

// ============================================================
// GENERATORS
// ============================================================

function arbEndTime() {
    return fc.oneof(
        fc.constant(''),
        fc.tuple(
            fc.integer({ min: 6, max: 22 }),
            fc.integer({ min: 0, max: 59 })
        ).map(function(t) {
            return String(t[0]).padStart(2, '0') + ':' + String(t[1]).padStart(2, '0') + ':00';
        })
    );
}

function arbEndTimeWithFalsy() {
    return fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.constant(undefined),
        fc.tuple(
            fc.integer({ min: 6, max: 22 }),
            fc.integer({ min: 0, max: 59 })
        ).map(function(t) {
            return String(t[0]).padStart(2, '0') + ':' + String(t[1]).padStart(2, '0') + ':00';
        })
    );
}

function arbVisitRow() {
    return fc.record({
        dateKey: fc.date({
            min: new Date('2024-01-01'),
            max: new Date('2027-12-31')
        }).map(function(d) {
            return d.toISOString().slice(0, 10);
        }),
        name: fc.constantFrom('JKT-ANCOL (AAA)', 'SBY-RUNGKUT (BBB)', 'BDG-CIMAHI (CCC)'),
        visited: fc.integer({ min: 0, max: 50 }),
        startTime: fc.constant('07:00:00'),
        endTime: arbEndTime(),
        invoice: fc.integer({ min: 0, max: 50000000 }),
        area: fc.constantFrom('JKT-ANCOL', 'SBY-RUNGKUT', 'BDG-CIMAHI'),
        divisi: fc.constantFrom('Sales', 'Marketing', 'Distribusi', '')
    });
}

// ============================================================
// PROPERTY TESTS
// ============================================================

console.log('\nSuite: Property 4: Status filter predicate correctness\n');

let total = 0;
let passed = 0;
let failed = 0;
let failures = [];

function runProperty(name, arbs, predicate, numRuns = 100) {
    total++;
    try {
        const result = fc.check(
            fc.property(...arbs, predicate),
            { numRuns: numRuns, verbose: 1 }
        );
        if (result.failed) {
            failed++;
            const counterexample = JSON.stringify(result.counterexample, null, 2);
            const error = 'Property falsified after ' + result.numRuns + ' tests. Seed: ' + result.seed;
            failures.push({ name, error, counterexample });
            console.log('  \u2717 ' + name);
            console.log('    ' + error);
            console.log('    Counterexample: ' + counterexample);
        } else {
            passed++;
            console.log('  \u2713 ' + name + ' (' + result.numRuns + ' iterations)');
        }
    } catch (e) {
        failed++;
        failures.push({ name, error: e.message });
        console.log('  \u2717 ' + name);
        console.log('    Error: ' + e.message);
    }
}

// Test 1: filterStatus='sudah' returns true only when endTime is non-empty
runProperty(
    'filterStatus "sudah" returns true only when endTime is non-empty',
    [arbEndTime()],
    function(endTime) {
        var result = statusFilterPredicate(endTime, 'sudah');
        if (endTime) {
            return result === true;
        } else {
            return result === false;
        }
    }
);

// Test 2: filterStatus='belum' returns true only when endTime is empty/falsy
runProperty(
    'filterStatus "belum" returns true only when endTime is empty/falsy',
    [arbEndTimeWithFalsy()],
    function(endTime) {
        var result = statusFilterPredicate(endTime, 'belum');
        if (!endTime) {
            return result === true;
        } else {
            return result === false;
        }
    }
);

// Test 3: filterStatus='' (empty) always returns true regardless of endTime
runProperty(
    'filterStatus empty string always returns true regardless of endTime',
    [arbEndTimeWithFalsy()],
    function(endTime) {
        return statusFilterPredicate(endTime, '') === true;
    }
);

// Test 4: Dataset filtering with "sudah" produces only rows with non-empty endTime
runProperty(
    'dataset filtering with "sudah" produces only rows with non-empty endTime',
    [fc.array(arbVisitRow(), { minLength: 1, maxLength: 50 })],
    function(rows) {
        var filtered = rows.filter(function(row) {
            return statusFilterPredicate(row.endTime, 'sudah');
        });
        // Every row in filtered must have non-empty endTime
        for (var i = 0; i < filtered.length; i++) {
            if (!filtered[i].endTime) return false;
        }
        // Every row NOT in filtered must have empty endTime
        var excluded = rows.filter(function(row) {
            return !statusFilterPredicate(row.endTime, 'sudah');
        });
        for (var i = 0; i < excluded.length; i++) {
            if (excluded[i].endTime) return false;
        }
        return true;
    }
);

// Report results
console.log('\n---');
console.log('Results: ' + passed + '/' + total + ' passed, ' + failed + ' failed');

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\nAll Property 4 tests passed!');
}
