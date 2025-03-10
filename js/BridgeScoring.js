// BridgeScoring.js
var BridgeScoring = (function() {
    // Constants for scoring calculations
    const TRICK_VALUES = {
        'C': 20, 'D': 20, 'H': 30, 'S': 30, 'NT': 30
    };

    const BONUS_SCORES = {
        PART_SCORE: 50,
        GAME: {
            VULNERABLE: 500,
            NON_VULNERABLE: 300
        },
        SMALL_SLAM: {
            VULNERABLE: 750,
            NON_VULNERABLE: 500
        },
        GRAND_SLAM: {
            VULNERABLE: 1500,
            NON_VULNERABLE: 1000
        },
        DOUBLED: 50,
        REDOUBLED: 100
    };

    class Scorer {
        constructor() {
            this.resetScore();
        }

        resetScore() {
            this.breakdown = {
                trickScore: 0,
                overtrickScore: 0,
                bonusScore: 0,
                slamBonus: 0,
                doubledBonus: 0
            };
        }

        calculateScore(level, suit, tricks, vulnerable, doubled = false, redoubled = false) {
            this.resetScore();
            
            try {
                const contractTricks = level + 6;
                
                // Base trick score calculation
                if (suit === 'NT') {
                    this.breakdown.trickScore = 40 + (30 * (level - 1));
                } else {
                    this.breakdown.trickScore = level * TRICK_VALUES[suit];
                }

                // Apply doubling multipliers
                if (redoubled) {
                    this.breakdown.trickScore *= 4;
                } else if (doubled) {
                    this.breakdown.trickScore *= 2;
                }

                if (tricks >= contractTricks) {
                    // Making the contract
                    
                    // Calculate overtricks
                    if (tricks > contractTricks) {
                        const overtricks = tricks - contractTricks;
                        if (!doubled && !redoubled) {
                            const overtrickValue = suit === 'NT' ? 30 : TRICK_VALUES[suit];
                            this.breakdown.overtrickScore = overtrickValue * overtricks;
                        } else if (doubled) {
                            this.breakdown.overtrickScore = (vulnerable ? 200 : 100) * overtricks;
                        } else if (redoubled) {
                            this.breakdown.overtrickScore = (vulnerable ? 400 : 200) * overtricks;
                        }
                    }

                    // Game or partscore bonus
                    let basePoints = suit === 'NT' ? 40 + (30 * (level - 1)) : level * TRICK_VALUES[suit];
                    if (doubled) basePoints *= 2;
                    if (redoubled) basePoints *= 4;
                    
                    if (basePoints >= 100) {
                        this.breakdown.bonusScore = vulnerable ? 
                            BONUS_SCORES.GAME.VULNERABLE : 
                            BONUS_SCORES.GAME.NON_VULNERABLE;
                    } else {
                        this.breakdown.bonusScore = BONUS_SCORES.PART_SCORE;
                    }

                    // Slam bonus
                    if (level === 6) {
                        this.breakdown.slamBonus = vulnerable ? 
                            BONUS_SCORES.SMALL_SLAM.VULNERABLE : 
                            BONUS_SCORES.SMALL_SLAM.NON_VULNERABLE;
                    } else if (level === 7) {
                        this.breakdown.slamBonus = vulnerable ? 
                            BONUS_SCORES.GRAND_SLAM.VULNERABLE : 
                            BONUS_SCORES.GRAND_SLAM.NON_VULNERABLE;
                    }

                    // Insult bonus for making doubled/redoubled contracts
                    if (doubled) {
                        this.breakdown.doubledBonus = BONUS_SCORES.DOUBLED;
                    } else if (redoubled) {
                        this.breakdown.doubledBonus = BONUS_SCORES.REDOUBLED;
                    }

                    return Object.values(this.breakdown).reduce((a, b) => a + b, 0);

                } else {
                    // Going down
                    const undertricks = contractTricks - tricks;
                    let undertrickScore = 0;

                    if (vulnerable) {
                        if (redoubled) {
                            undertrickScore = -(undertricks * 400);
                        } else if (doubled) {
                            undertrickScore = -(undertricks * 200);
                        } else {
                            undertrickScore = -(undertricks * 100);
                        }
                    } else {
                        if (redoubled) {
                            undertrickScore = -(200 + ((undertricks - 1) * 400));
                        } else if (doubled) {
                            undertrickScore = -(100 + ((undertricks - 1) * 200));
                        } else {
                            undertrickScore = -(undertricks * 50);
                        }
                    }

                    return undertrickScore;
                }

            } catch (error) {
                throw new Error(`Scoring error: ${error.message}`);
            }
        }

        // Alternative method using object parameter
        calculateScoreObject({contract, tricks, vulnerable, doubled = 'none'}) {
            const level = parseInt(contract.charAt(0));
            const suit = contract.slice(1);
            const isRedoubled = doubled === 'redoubled';
            const isDoubled = doubled === 'doubled';
            
            return this.calculateScore(level, suit, tricks, vulnerable, isDoubled, isRedoubled);
        }

        // Helper method to get score breakdown
        getBreakdown() {
            return { ...this.breakdown };
        }
    }

    // Public interface
    return {
        createScorer: function() {
            return new Scorer();
        },
        // Legacy support for original function signature
        calculateScore: function(level, suit, made, vulnerable, doubled = false, redoubled = false) {
            const scorer = new Scorer();
            return scorer.calculateScore(level, suit, made, vulnerable, doubled, redoubled);
        }
    };
})();

// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BridgeScoring;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.BridgeScoring = BridgeScoring;
}