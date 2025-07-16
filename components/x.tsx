// X (Twitter) post configuration file
// All X post related content should be stored here
import { CONTRACT_ADDRESS } from './contract';

// Captions for X post when sharing PFP
const PFP_CAPTIONS = [
  `Just switched to my $BUBU PFP. Might be the best one on the timeline right now.

Show me what you got. Drop your PFP in the replies. 😎

${CONTRACT_ADDRESS}`,
  
  `The ultimate flex isn't just having a cool PFP—it's creating it yourself.

Meet $BUBU. 🔥

Now you flex yours. Show me your go-to PFP!

${CONTRACT_ADDRESS}`,
  
  `IT'S TIME FOR A PFP BATTLE! ⚔️

I'll start with $BUBU, my latest creation. Who's challenging me? Drop your PFP below and let's see who comes out on top!

${CONTRACT_ADDRESS}`,
  
  `PFP check. My level: $BUBU.

What are you repping?

${CONTRACT_ADDRESS}`
];

// Function to get a random caption
const getRandomCaption = (): string => {
  const randomIndex = Math.floor(Math.random() * PFP_CAPTIONS.length);
  return PFP_CAPTIONS[randomIndex];
};

// Export the random caption for use in other components
export const PFP_X_CAPTION = getRandomCaption();
