
import { Orchestrator, Player, Cell } from "@holochain/tryorama";
import { config, installation, sleep } from '../utils';

export default (orchestrator: Orchestrator<any>) => 
  orchestrator.registerScenario("mews tests", async (s, t) => {
    // Declare two players using the previously specified config, nicknaming them "alice" and "bob"
    // note that the first argument to players is just an array conductor configs that that will
    // be used to spin up the conductor processes which are returned in a matching array.
    const [alice_player, bob_player]: Player[] = await s.players([config, config]);

    // install your happs into the conductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    const [[alice_happ]] = await alice_player.installAgentsHapps(installation);
    const [[bob_happ]] = await bob_player.installAgentsHapps(installation);

    await s.shareAllNodes([alice_player, bob_player]);

    const alice = alice_happ.cells.find(cell => cell.cellRole.includes('/clutter.dna')) as Cell;
    const bob = bob_happ.cells.find(cell => cell.cellRole.includes('/clutter.dna')) as Cell;

    const postContents = "My Mew";

    // Alice creates a post
    const mewHash = await alice.call(
        "mews",
        "create_mew",
        postContents
    );
    t.ok(mewHash);

    await sleep(50);
    
    // Bob gets the created mew
    const mew = await bob.call("mews", "get_mew", mewHash);
    t.equal(mew, postContents);

    const mews = await bob.call("mews", "mews_feed", {option: ""})
    t.equal(mews[0].entry, "MyTest");

});
