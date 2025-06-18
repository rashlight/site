---
date: "2025-04-05T13:01:32+07:00"
title: "Lilium"
description: "Unify programs and libraries on Linux"
tags: ["linux", "kernel", "development", "networking", "ioctl"]
---

Lilium helps you to run custom libraries and programs in Linux, regardless of version.

See the source code [here](https://github.com/rashlight/lilium).

{{<admonition type="warning">}}
This project is very experimental. Components such as IOCTL number and netlink socket group must be changed
depending on your needs. Failure to so do may cause conflicts on other modules.
{{</admonition>}}

- [Installation](#installation)
- [Usage](#usage)
- [Write your own plugin](#write-your-own-plugin)

# Installation

For normal usage, DKMS (Dynamic Kernel Module Support) configuration is included and is the recommended method:

```bash
git clone https://github.com/rashlight/lilium.git
cd lilium
sudo dkms add .
sudo dkms build lilium-module -v 1.0
sudo dkms install --force lilium-module -v 1.0
```

For development:

```bash
git clone https://github.com/rashlight/lilium.git
cd lilium
sudo make
sudo insmod lilium.ko
```

# Usage

Included in `example` folder is a simple demonstration to get started.
It utilizes a plugin that works with glibc located in `plugin/plugin-glib.c`.

Follow the [installation section](#installation) above first.

To interface with the lilium module (API), a compabtible plugin needs to be installed.
It implements the functions necessary to allow binaries to interface with the API.
After running, you can implement execution like this:

```c
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <path/to/lilium.h>

#define IOCTL_MAGIC 'a' /* Chang/e it to something else with your requirement */
#define WR_LM_FUN _IOWR(IOCTL_MAGIC, '3', unsigned long)

void main(void) {
    int fd = open("/dev/lilium", O_RDWR);
    int fun_result;
	int val1 = 10;
	char fun_argv[LILIUM_MAX_ARGS][LILIUM_SYMBOL_LENGTH] = { ... };
	memcpy(&(fun_argv[0]), &val1, sizeof(int));

	struct lm_fun_data fun_data = {
		.ret_type = LILIUM_FUN_RET_INT, // a function that return an integer
		.input_size = 1, // number of arguments
		.sym = "binary_name",
		.ver = "version",
		.name = "function_name",
		.argv = "" // empty so we can copy data later
	};
	memcpy(&(fun_data.argv[0]), fun_argv, sizeof(fun_argv));

	struct lm_ret fun_ret = {
		.val = ""
	};

	struct lm_pkt_user fun_pkt = {
		.opcode = LILIUM_FUN_OPCODE,
		.input = &fun_data,
		.output = &fun_ret,
	};

	res = ioctl(fd, WR_LM_FUN, &fun_pkt);
    // Do something with the return value...
}
```

By default, this requires root permission to run (sudo).
Depending on the plugin implementation, user binaries can be ran as well.

To formulate the data, wrap your payload inside `lm_exec_data` or `lm_fun_data` struct. A passed `lm_ret` struct when calling will return the value inside if avaiable, or NULL, and the `ioctl()` command sends the error code.

# Write your own plugin

These information below are advisory.
You are recommended to see the glibc implementation in `plugin/plugin-glib.c`.

The plugin communicates with the lilium module through a netlink socket. Create a new socket, then use the group number _31_ (default), or any other number defined in the kernel module to establish connection. For basic netlink usage, `NLMSG_SPACE()` and `NLMSG_DATA()` can be used to assist in netlink packet creation, and function `recvmsg()` and `sendmsg()` handles the processing of the packet.

The lilium header file `lilium.h` contains the necessary compilation information that the plugin must follow. Otherwise, memory problems can occur. Some of those constants that are exposed are:

| Name                 | Default value              | Description                                                                    |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| LILIUM_SYMBOL_LENGTH | 128                        | The maximum size of the symbol name, **including the NULL terminator.**        |
| LILIUM_MAX_ARGS      | 5                          | Maximum program arguments (the first one is usually reserved for program path) |
| LILIUM_MAX_SIZE      | 13 \* LILIUM_SYMBOL_LENGTH | The maximum payload that can be stored in a packet.                            |

Currently, lilium module can work with these function signatures:

| Name                   | Value | Return type |
| ---------------------- | ----- | ----------- |
| LILIUM_FUN_RET_VOID    | 0     | void        |
| LILIUM_FUN_RET_INT     | 1     | int         |
| LILIUM_FUN_RET_CHARPTR | 2     | char\*      |

There are also operation code (opcode) for the type of work the program requested lilium to do.

| Name                     | Value | Description                               |
| ------------------------ | ----- | ----------------------------------------- |
| LILIUM_RECEIVE_OPCODE    | 0     | Received payload from plugin              |
| LILIUM_PING_OPCODE       | 1     | Check if plugin exists                    |
| LILIUM_REGISTER_OPCODE   | 2     | Authenticate with plugin (impl-defined)   |
| LILIUM_UNREGISTER_OPCODE | 3     | Deauthenticate with plugin (impl-defined) |
| LILIUM_EXEC_OPCODE       | 4     | Execute process                           |
| LILIUM_FUN_OPCODE        | 5     | Execute function signature                |

For convenience, lilium uses these structs to handle communication. Applications should not use these structs, as this is for plugin communication only.

```c
// Return type from lilium kernel module
struct lm_pkt_module {
	int opcode;
	char data[LILIUM_MAX_SIZE];
};
```

```c
// Packet to send back to module after binary execution
struct lm_pkt_plugin {
	int opcode;
	char data[LILIUM_MAX_SIZE];
};
```

A plugin also need to handle version changes (which can be different for every programs), and handles differences from libc system (like GNU extensions) when required.
