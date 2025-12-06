module.exports = {
    name: "kill",
    category: "fun",
    description: "Kills a user in a funny / random way.",
    usage: "kill @user",

    run: async (client, message, args) => {

        // Block @everyone / @here
        const everyonePattern = /@(everyone|here)/gi;
        const argsFiltered = args.filter(arg => !everyonePattern.test(arg));

        if (!argsFiltered[0]) {
            return message.restSend("❌ For safety, `@everyone` and `@here` are not allowed.");
        }

        // No args at all
        if (!args.length) {
            return message.restSend("😵 You're trying to kill the air?");
        }

        // Determine target
        let target = message.mentions.members.first();
        const author = message.member;

        // If no valid member mention → fallback to plain text
        if (!target) {
            target = args.join(" ");
        } else {
            target = `<@${target.id}>`;
        }

        const kills = [
            `after a long day, ${author} sits with ${target} and turns on The Big Bang Theory. ${target} laughs so hard they die.`,
            `${author} Alt+F4’d ${target}.exe!`,
            `${author} explodes ${target}'s head with a flute solo.`,
            `${author} crushes ${target} with a fridge.`,
            `${author} decapitates ${target} with a sword.`,
            `${author} drowns ${target} in hot chocolate.`,
            `${author} throws ${target} into space.`,
            `${author} shoots ${target} using a rainbow laser.`,
            `${author} slips bleach into ${target}'s lemonade.`,
            `${author} casts *Avada Kedavra!* on ${target}.`,
            `${author} Hulk-smashes ${target} into paste.`,
            `${target} dies from touching grass.`,
            `${target} dies from cringe.`,
            `${target} died because ${author} was too swag.`,
            `${target} dies after watching the Emoji Movie.`,
            `${target} dies of natural causes. (boring!)`,
            `${target} is abducted by aliens.`,
            `${target} gets stepped on by an elephant.`,
            `${target} dies in a freak Minecraft accident.`,
            `${target} dies… OOF.`,
            `After a struggle, ${target} kills ${author} instead. Plot twist.`,
            `${target} disappears from the universe.`,
            `${target} drowned in their own tears.`,
            `${target} chokes on a chicken nugget.`,
            `${target} gets run over by a PT Cruiser. Sad.`,
            `${target} tries to dab too hard and dies.`,
            `${target} dies attempting a bottle flip.`,
            `${target} is eaten alive by ants.`,
            `${target} dies from oversucc.`,
            `${target} was murdered by ${author} and no one talks about it.`,
            `${target} was hit by The Undertaker from the top rope.`,
            `${target} pressed a random button and teleported into danger.`,
            `Calling upon the divine powers, ${author} smites ${target}.`,
            `In a sudden turn of events, I *don’t* kill ${target}.`,
            `no u`,
            `Our lord Gaben smites ${target}.`,
            `Sorry ${author}, murder is wrong. Except ${target} deserves it.`,
            `The bullet missed Harambe and hit ${target}.`,
            `${target} fell into a pit of angry feminists.`,
            `${target} got stuck in an elephant. Don't ask.`,
        ];

        const result = kills[Math.floor(Math.random() * kills.length)];

        return message.restSend(result);
    }
};
