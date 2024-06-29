pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeCheck() {
    signal input birthdate;
    signal input timestamp;
    signal input ageThreshold; //seconds
    signal output out;

    signal age;
    age <== timestamp-birthdate;

    component gte;
    gte = GreaterThan(251);
    gte.in[0] <== age;
    gte.in[1] <== ageThreshold;

    out <== gte.out;
}

component main{public[ageThreshold]} = AgeCheck();