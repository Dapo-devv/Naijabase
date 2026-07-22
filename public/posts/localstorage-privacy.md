---
title: "Why Your Data Stays on Your Device"
date: "2026-03-18"
author: "NaijaBase Team"
---

Most apps you use have a simple but invisible business model: your data lives on their servers, and they control it. When you create an account, your information, your habits, your spending patterns, and your personal details are stored on a computer you will never see, in a data center you cannot visit, governed by a privacy policy you probably did not read. NaijaBase does not work this way. This article explains, in plain English, how NaijaBase stores your data and why that matters for you.

## What LocalStorage Actually Means

When you create an account on NaijaBase, nothing is sent to a server. Your username, your password, your market logs, your generator settings, your trips, and your savings data are all stored in a part of your web browser called LocalStorage. This is a small database that lives on your device — your phone, your laptop, your tablet — and it never leaves that device unless you explicitly export it.

This is fundamentally different from how most apps work. There is no NaijaBase server holding your data. There is no company database that could be hacked or sold. Your information is yours, and it stays where you put it.

## The Trade-off: Your Browser Is Your Vault

The advantage of this approach is privacy. Nobody at NaijaBase can see your data, because it never reaches us. There is no account on our side to compromise. If you log your market prices every day for a year, that rich personal history of your spending is yours alone.

The trade-off is that your browser is now your vault. If you clear your browser cache, reinstall your browser, or lose your device, your data is gone. This is why the Export feature exists. With one tap on the Profile page, you can download a complete JSON file containing everything NaijaBase knows about you. Save that file to your Google Drive, your email, or a USB stick, and you have a backup that survives anything.

## How Import Works

If you switch devices — say you move from an old phone to a new one — you can bring your data with you. On the new device, create your account, then use the Import button on the Profile page to upload the JSON file you exported earlier. NaijaBase validates the file structure and, if it is legitimate, overwrites your current data with the imported version. Your market logs, trips, generator settings, and savings streak all reappear exactly as you left them.

This is the closest thing to a self-hosted app that runs in a browser. You control your data completely, and you are responsible for backing it up. For many users, especially those concerned about privacy, this is a feature, not a bug.

## What About My Password?

Your password is also stored locally, in plain text within the LocalStorage object. This sounds scary, but consider the context. NaijaBase is a personal dashboard, not a banking app. The password exists to keep family members or casual snoopers from opening your dashboard, not to protect state secrets. Because the data never leaves your device, there is no server where a password breach could expose thousands of users at once.

That said, do not reuse your bank password here. Use something simple and memorable. The threat model is "someone picks up my phone and opens NaijaBase," not "a hacker breaches a server." Understanding this difference is the key to using NaijaBase appropriately.

## Why We Built It This Way

We built NaijaBase on LocalStorage because we believe that most personal data does not need to live on someone else's computer. Your market prices, your generator habits, your savings streak — these are personal records that serve you, not an advertiser or a data broker. By keeping them on your device, we eliminate an entire category of privacy risk. There is no server to breach, no database to leak, no third party to sell your data to.

The cost is that you, the user, have to take responsibility for backing up. We have made that as easy as possible with the Export feature, and we remind you on the Profile page to do it. But the responsibility is yours, and we think that is how it should be.

## Conclusion

NaijaBase is built on a simple idea: your data belongs to you, and it should live where you control it. LocalStorage keeps everything on your device. Export lets you back it up. Import lets you move it. There is no server in the middle, no company holding your information, and no privacy policy to trust. The trade-off is that you must manage your own backups, but for the privacy and control you gain, it is a trade worth making. Export your data today, and keep it somewhere safe.
