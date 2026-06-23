#!/bin/bash
# PetRadar Pro — JMeter Runner
# ./run-jmeter.sh                 → Load Test with defaults
# ./run-jmeter.sh load            → Load Test (20 users, 10 min)
# ./run-jmeter.sh stress          → Stress Test (100 users)
# ./run-jmeter.sh spike           → Spike Test (200 users)
# ./run-jmeter.sh soak            → Soak Test (10 users, 2h)

JMETER="$(dirname "$0")/tools/apache-jmeter/bin/jmeter.sh"
JMX="$(dirname "$0")/docs/jmeter-test-plan.jmx"

case "$1" in
    stress)  OPTS="-Jduration=120 -Jthreads=100 -Jramp=30" ;;
    spike)   OPTS="-Jduration=60 -Jthreads=200 -Jramp=5" ;;
    soak)    OPTS="-Jduration=7200 -Jthreads=10 -Jramp=60" ;;
    *)       OPTS="-Jduration=600 -Jthreads=20 -Jramp=30" ;;
esac

echo "🐾 PetRadar Pro — JMeter $1 Load Test"
echo "═══════════════════════════════════════════"
echo "JMeter: $JMETER"
echo "Plan:   $JMX"
echo "Args:   $OPTS"
echo ""

# Ensure backend is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend not running on :3000 — start it first:"
    echo "   cd $(dirname "$0") && npm run start:dev"
    exit 1
fi

exec "$JMETER" -n -t "$JMX" $OPTS -l "$(dirname "$0")/logs/jmeter-results.jtl"
