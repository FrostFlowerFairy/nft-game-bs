// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;


// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract NFTGame is ERC721{

// We'll hold our character's attributes in a struct. Feel free to add
  // whatever you'd like as an attribute! (ex. defense, crit chance, etc).
    struct CharacterAttributes {
        uint characterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    struct BigBoss {
      string name;
      string imageURI;
      uint hp;
      uint maxHp;
      uint attackDamage;
    }

    BigBoss public bigBoss;

    // The tokenId is the NFTs unique identifier, it's just a number that goes
  // 0, 1, 2, 3, etc.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;


// A lil array to help us hold the default data for our characters.
  // This will be helpful when we mint new characters and need to know
  // things like their HP, AD, etc.
    CharacterAttributes[] defaultCharacters;

    // We create a mapping from the nft's tokenId => that NFTs attributes.
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    // ADDRESS => TokenId, to store the owner of the NFT and reference it later.
    mapping(address => uint256) public nftHolders;

  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
  event AttackComplete(address sender, uint newBossHp, uint newPlayerHp);



  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    string memory bossName,
    string memory bossImageURI,
    uint bossHp, 
    uint bossAttackDamage
  ) ERC721("SuperHeroes", "SHero") {

    // Initialize the boss. Save it to our global "bigBoss" state variable.
  bigBoss = BigBoss({
    name: bossName,
    imageURI: bossImageURI,
    hp: bossHp,
    maxHp: bossHp,
    attackDamage: bossAttackDamage
  });

  console.log("Done initializing boss %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);
    
     // Loop through all the characters, and save their values in our contract so
    // we can use them later when we mint our NFTs.
    for(uint i = 0; i < characterNames.length; i += 1) {
        defaultCharacters.push(CharacterAttributes(
            {
            characterIndex: i,
            name: characterNames[i],
            imageURI: characterImageURIs[i],
            hp: characterHp[i],
            maxHp: characterHp[i],
            attackDamage: characterAttackDmg[i]
            }
        ));

      CharacterAttributes memory c = defaultCharacters[i];
      console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);
    }


    console.log("THIS IS MY GAME CONTRACT. NICE.");
    // increment _tokenIds here so that the first NFT has an ID of 1.
    _tokenIds.increment();
  }

    // Users would be able to hit this function and get their NFT based on the
    // characterId they send in!
    function mintCharacterNFT(uint _characterIndex) external {
    // Get current tokenId (starts at 1 since we incremented in the constructor).
        uint256 newItemId = _tokenIds.current();

        // The magical function! Assigns the tokenId to the caller's wallet address.
        _safeMint(msg.sender, newItemId);

        // We map the tokenId => their character attributes. More on this in
        // the lesson below.
        nftHolderAttributes[newItemId] = CharacterAttributes({
        characterIndex: _characterIndex,
        name: defaultCharacters[_characterIndex].name,
        imageURI: defaultCharacters[_characterIndex].imageURI,
        hp: defaultCharacters[_characterIndex].hp,
        maxHp: defaultCharacters[_characterIndex].maxHp,
        attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);
        
        // Keep an easy way to see who owns what NFT.
        nftHolders[msg.sender] = newItemId;

        // Increment the tokenId for the next person that uses it.
        _tokenIds.increment();
        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

        string memory json = Base64.encode(
            abi.encodePacked(
            '{"name": "',
            charAttributes.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
            charAttributes.imageURI,
            '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
            strAttackDamage,'} ]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        
        return output;
    }

    function attackBoss() public {
      uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
      require(nftTokenIdOfPlayer != 0, "Player NFT not found");
      // Get the state of the player's NFT.
      CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
      // I use the keyword storage here as well which will be more important a bit later. Basically, when we do storage and then do player.hp = 0 then it would change the health value on the NFT itself to 0.
      // In contrast, if we were to use memory instead of storage it would create a local copy of the variable within the scope of the function. That means if we did player.hp = 0 it would only be that way within the function and wouldn't change the global value.
      // Make sure the player has more than 0 HP.
      require(player.hp > 0, "Player doesn't have any HP");
      // Make sure the boss has more than 0 HP.
      require(bigBoss.hp > 0, "BigBoss doesn't have any HP");

      console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
      console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);

      // Allow player to attack boss.
      if (bigBoss.hp < player.attackDamage) {
        bigBoss.hp = 0;
      } else {
        bigBoss.hp = bigBoss.hp - player.attackDamage;
      }
       // Console for ease.
      console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);


      // Allow boss to attack player.
        if(bigBoss.hp == 0) {
          console.log("Bigboss is dead. hp: %s", bigBoss.hp);
        }
        else {
          if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
          } else {
            player.hp = player.hp - bigBoss.attackDamage;
          }
          console.log("Boss attacked player. New player hp: %s\n", player.hp);
        }

      emit AttackComplete(msg.sender, bigBoss.hp, player.hp);
    } 

    function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
      return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
      return bigBoss;
    }

    function checkIfUserHasNFT() public view returns (CharacterAttributes memory) {
      // Get the tokenId of the user's character NFT
      uint256 userNftTokenId = nftHolders[msg.sender];
      // If the user has a tokenId in the map, return their character.
      if (userNftTokenId > 0) {
        return nftHolderAttributes[userNftTokenId];
      }
      // Else, return an empty character.
      else {
        CharacterAttributes memory emptyStruct;
        return emptyStruct;
      }
    }


}